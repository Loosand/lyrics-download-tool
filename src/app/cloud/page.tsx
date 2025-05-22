"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Root as SearchRoot, Song } from "./types/search"
import { Root as SongRoot, Song as SongDetail, Artist } from "./types/details"
import { Root as LyricRoot } from "./types/lyric"

export default function Page() {
	const [searchKeyword, setSearchKeyword] = useState("")
	const [searchResults, setSearchResults] = useState<Song[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [songDetails, setSongDetails] = useState<SongDetail | null>(null)
	const [lyrics, setLyrics] = useState<string>("")
	const [translatedLyrics, setTranslatedLyrics] = useState<string>("")
	const [dialogOpen, setDialogOpen] = useState(false)

	// 搜索歌曲
	const handleSearch = async () => {
		if (!searchKeyword.trim()) return

		setIsLoading(true)
		try {
			const response = await fetch(
				`/api/music/search?keyword=${encodeURIComponent(
					searchKeyword
				)}&limit=15`
			)
			const data: SearchRoot = await response.json()
			setSearchResults(data.result.songs)
		} catch (error) {
			console.error("搜索失败:", error)
		} finally {
			setIsLoading(false)
		}
	}

	// 获取歌曲详情
	const handleGetSongDetails = async (songId: number) => {
		console.log("获取歌曲详情，ID:", songId)
		try {
			// 获取歌曲详情
			console.log("请求详情API开始")
			const detailsResponse = await fetch(`/api/music/details?id=${songId}`)
			const detailsData: SongRoot = await detailsResponse.json()
			console.log("详情API返回:", detailsData)
			setSongDetails(detailsData.songs[0])

			// 获取歌词
			console.log("请求歌词API开始")
			const lyricsResponse = await fetch(`/api/music/lyrics?id=${songId}`)
			const lyricsData: LyricRoot = await lyricsResponse.json()
			console.log("歌词API返回:", lyricsData)
			setLyrics(lyricsData.lrc?.lyric || "暂无歌词")
			setTranslatedLyrics(lyricsData.tlyric?.lyric || "")

			setDialogOpen(true)
		} catch (error) {
			console.error("获取歌曲详情失败:", error)
			alert("获取歌曲详情失败，请查看控制台日志")
		} finally {
		}
	}

	// 下载MP3文件
	const handleDownloadMp3 = (songId: number, songName: string) => {
		const link = document.createElement("a")
		link.href = `https://music.163.com/song/media/outer/url?id=${songId}.mp3`
		link.download = `${songName}.mp3`
		link.target = "_blank"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// 下载歌词
	const handleDownloadLyrics = (songName: string) => {
		const element = document.createElement("a")
		let text = lyrics

		if (translatedLyrics) {
			text += "\n\n-- 翻译歌词 --\n\n" + translatedLyrics
		}

		const file = new Blob([text], { type: "text/plain" })
		element.href = URL.createObjectURL(file)
		element.download = `${songName}.lrc`
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}

	// 格式化时间（毫秒转为分:秒）
	const formatDuration = (duration: number) => {
		const minutes = Math.floor(duration / 1000 / 60)
		const seconds = Math.floor((duration / 1000) % 60)
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
	}

	// 格式化歌词显示
	const formatLyrics = (lyricText: string) => {
		return lyricText
			.split("\n")
			.map((line) => {
				// 移除时间标记 [00:00.000]
				return line.replace(/\[\d+:\d+\.\d+\]/g, "")
			})
			.filter((line) => line.trim() !== "")
			.join("\n")
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-6">网易云音乐搜索</h1>

			<div className="flex gap-2 mb-6">
				<Input
					type="text"
					placeholder="输入歌曲名称或歌手"
					value={searchKeyword}
					onChange={(e) => setSearchKeyword(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					className="flex-1"
				/>
				<Button onClick={handleSearch} disabled={isLoading}>
					{isLoading ? "搜索中..." : "搜索"}
				</Button>
			</div>

			{searchResults.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>搜索结果</CardTitle>
						<CardDescription>
							找到 {searchResults.length} 首歌曲
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>歌曲</TableHead>
									<TableHead>歌手</TableHead>
									<TableHead>专辑</TableHead>
									<TableHead>时长</TableHead>
									<TableHead>操作</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{searchResults.map((song) => (
									<TableRow key={song.id}>
										<TableCell className="font-medium">{song.name}</TableCell>
										<TableCell>
											{song.artists.map((artist) => artist.name).join(", ")}
										</TableCell>
										<TableCell>{song.album.name}</TableCell>
										<TableCell>{formatDuration(song.duration)}</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleGetSongDetails(song.id)}>
												详情
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
					{songDetails && (
						<>
							<DialogHeader>
								<DialogTitle>{songDetails.name}</DialogTitle>
								<DialogDescription>
									{songDetails.artists
										?.map((artist: Artist) => artist.name)
										.join(", ")}{" "}
									- {songDetails.album?.name}
								</DialogDescription>
							</DialogHeader>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
								<div>
									<div className="rounded-md overflow-hidden">
										<img
											src={songDetails.album?.picUrl}
											alt={songDetails.album?.name}
											className="w-full h-auto object-cover"
										/>
									</div>

									<div className="flex gap-2 mt-4">
										<Button
											onClick={() =>
												handleDownloadMp3(songDetails.id, songDetails.name)
											}
											className="flex-1">
											下载 MP3
										</Button>
										<Button
											variant="outline"
											onClick={() => handleDownloadLyrics(songDetails.name)}
											className="flex-1">
											下载歌词
										</Button>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold mb-2">歌词</h3>
									<div className="max-h-[300px] overflow-y-auto border rounded-md p-4 text-sm whitespace-pre-line">
										{formatLyrics(lyrics)}

										{translatedLyrics && (
											<>
												<Separator className="my-4" />
												<p className="text-muted-foreground font-medium mb-2">
													翻译歌词:
												</p>
												{formatLyrics(translatedLyrics)}
											</>
										)}
									</div>
								</div>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
