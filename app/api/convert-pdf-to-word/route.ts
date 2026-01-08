import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for file conversion

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有上传文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: '文件必须是 PDF 格式' },
        { status: 400 }
      )
    }

    // 验证文件大小（限制为 50MB）
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 50MB' },
        { status: 400 }
      )
    }

    const apiKey = process.env.CLOUDCONVERT_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'CloudConvert API Key 未配置。请在环境变量中设置 CLOUDCONVERT_API_KEY',
        },
        { status: 500 }
      )
    }

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 创建转换任务
    const createJobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'import-1': {
            operation: 'import/upload',
          },
          'convert-1': {
            operation: 'convert',
            input: 'import-1',
            output_format: 'docx',
            engine: 'libreoffice',
          },
          'export-1': {
            operation: 'export/url',
            input: 'convert-1',
          },
        },
      }),
    })

    if (!createJobResponse.ok) {
      let errorMessage = '创建转换任务失败'
      try {
        const error = await createJobResponse.json()
        errorMessage = error.message || errorMessage
        console.error('CloudConvert 创建任务失败:', error)
      } catch {
        const errorText = await createJobResponse.text()
        console.error('CloudConvert 创建任务失败:', errorText)
        errorMessage = errorText.substring(0, 200)
      }
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    const jobData = await createJobResponse.json()

    // 上传文件到 CloudConvert
    const uploadTask = jobData.tasks?.find(
      (task: any) => task.operation === 'import/upload'
    )

    if (!uploadTask) {
      return NextResponse.json(
        { success: false, error: '获取上传任务失败' },
        { status: 500 }
      )
    }

    const uploadUrl = uploadTask.result?.form?.url
    const formParameters = uploadTask.result?.form?.parameters || {}

    if (!uploadUrl) {
      return NextResponse.json(
        { success: false, error: '获取上传 URL 失败' },
        { status: 500 }
      )
    }

    // 创建 FormData 并添加所有必需的表单参数
    const uploadFormData = new FormData()
    
    // 添加 CloudConvert 返回的表单参数
    Object.keys(formParameters).forEach((key) => {
      uploadFormData.append(key, formParameters[key])
    })
    
    // 添加文件
    uploadFormData.append('file', new Blob([buffer]), file.name)

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('文件上传失败:', errorText)
      return NextResponse.json(
        { success: false, error: '文件上传失败: ' + errorText.substring(0, 100) },
        { status: 500 }
      )
    }

    // 等待转换完成
    const jobId = jobData.id
    let jobStatus = 'waiting'
    let downloadUrl = null
    let attempts = 0
    const maxAttempts = 60 // 最多等待 5 分钟（每 5 秒检查一次）

    while (jobStatus !== 'finished' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // 等待 5 秒

      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!statusResponse.ok) {
        return NextResponse.json(
          { success: false, error: '获取任务状态失败' },
          { status: 500 }
        )
      }

      const statusData = await statusResponse.json()
      jobStatus = statusData.status

      if (jobStatus === 'finished') {
        const exportTask = statusData.tasks?.find(
          (task: any) => task.operation === 'export/url' && task.status === 'finished'
        )
        downloadUrl = exportTask?.result?.files?.[0]?.url
        if (downloadUrl) {
          break
        }
      } else if (jobStatus === 'error') {
        const errorTask = statusData.tasks?.find((task: any) => task.status === 'error')
        const errorMessage = errorTask?.message || '转换失败'
        console.error('转换失败:', errorMessage, statusData)
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 500 }
        )
      }

      attempts++
    }

    if (!downloadUrl) {
      return NextResponse.json(
        { success: false, error: '转换超时或失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      conversionId: jobId,
    })
  } catch (error) {
    console.error('PDF 转 Word 错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '转换失败',
      },
      { status: 500 }
    )
  }
}

