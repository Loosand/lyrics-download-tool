import { NextResponse } from "next/server"

export async function GET(request: Request) {
	const url = new URL(request.url)
	const keyword = url.searchParams.get("keyword")
	const limit = url.searchParams.get("limit") || "15"
	const offset = url.searchParams.get("offset") || "0"

	if (!keyword) {
		return NextResponse.json({ error: "关键词不能为空" }, { status: 400 })
	}

	try {
		const apiUrl = `https://music.163.com/api/search/get?s=${encodeURIComponent(
			keyword
		)}&type=1&offset=${offset}&limit=${limit}`

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
		console.error("搜索API错误:", error)
		return NextResponse.json({ error: "搜索失败" }, { status: 500 })
	}
}
