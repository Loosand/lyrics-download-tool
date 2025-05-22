import { NextResponse } from "next/server"

export async function GET(request: Request) {
	const url = new URL(request.url)
	const id = url.searchParams.get("id")

	if (!id) {
		return NextResponse.json({ error: "歌曲ID不能为空" }, { status: 400 })
	}

	try {
		// 修改为数组格式的ids参数
		const apiUrl = `https://music.163.com/api/song/detail?ids=[${id}]`

		const response = await fetch(apiUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Referer: "https://music.163.com/",
			},
		})

		if (!response.ok) {
			throw new Error("网易云API请求失败")
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error("获取歌曲详情API错误:", error)
		return NextResponse.json({ error: "获取歌曲详情失败" }, { status: 500 })
	}
}
