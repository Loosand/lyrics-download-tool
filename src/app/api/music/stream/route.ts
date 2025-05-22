import { NextResponse } from "next/server"

export async function GET(request: Request) {
	const url = new URL(request.url)
	const id = url.searchParams.get("id")

	if (!id) {
		return NextResponse.json({ error: "歌曲ID不能为空" }, { status: 400 })
	}

	try {
		console.log(`开始流式传输歌曲ID: ${id}`)

		// 网易云音乐MP3外链
		const musicUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`

		// 发送请求获取音频
		const response = await fetch(musicUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Referer: "https://music.163.com/",
			},
			redirect: "follow", // 自动跟随重定向
		})

		// 检查响应是否成功
		if (!response.ok) {
			console.error(`音频流获取失败，状态码: ${response.status}`)
			throw new Error(`获取音频失败，状态码: ${response.status}`)
		}

		console.log(`响应状态: ${response.status}, URL: ${response.url}`)

		// 记录响应头
		console.log("响应头信息:")
		for (const [key, value] of response.headers.entries()) {
			console.log(`${key}: ${value}`)
		}

		// 获取音频内容
		const data = await response.arrayBuffer()
		console.log(`音频数据已获取，大小: ${data.byteLength} 字节`)

		// 如果数据大小为0或太小，可能是重定向后的错误页面
		if (data.byteLength < 1000) {
			console.error("获取到的数据太小，可能不是有效的音频文件")

			// 尝试直接返回固定的MP3 URL，可能适用于一些歌曲
			const alternateUrl = `http://music.163.com/song/media/outer/url?id=${id}.mp3`
			return NextResponse.redirect(alternateUrl)
		}

		// 获取内容类型，确保设置为音频类型
		const contentType = "audio/mpeg" // 强制设置为MP3类型

		// 返回音频流
		return new Response(data, {
			headers: {
				"Content-Type": contentType,
				"Content-Length": String(data.byteLength),
				"Cache-Control": "public, max-age=31536000",
				"Access-Control-Allow-Origin": "*", // 允许跨域
			},
		})
	} catch (error) {
		console.error("音频流处理错误:", error)

		// 如果出错，可以尝试直接重定向到网易云的URL
		// 这样浏览器会直接处理重定向，可能会绕过一些问题
		const fallbackUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
		console.log(`尝试重定向到: ${fallbackUrl}`)

		return NextResponse.redirect(fallbackUrl)
	}
}
