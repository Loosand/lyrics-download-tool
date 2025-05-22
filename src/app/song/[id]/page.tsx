"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
	Root as SongRoot,
	Song as SongDetail,
	Artist,
} from "../../cloud/types/details"
import { Root as LyricRoot } from "../../cloud/types/lyric"
import {
	formatLyrics,
	combineDisplayLyrics,
	separateCombinedLyrics,
	downloadLyrics,
	downloadImage,
} from "@/lib/lyrics"

export default function SongDetailPage() {
	const params = useParams()
	const router = useRouter()
	const songId = params.id ? Number(params.id) : null

	const [songDetails, setSongDetails] = useState<SongDetail | null>(null)
	const [translatedLyrics, setTranslatedLyrics] = useState<string>("")
	const [isLoading, setIsLoading] = useState(true)
	const [editedOriginalLyrics, setEditedOriginalLyrics] = useState<string>("")
	const [editedTranslatedLyrics, setEditedTranslatedLyrics] =
		useState<string>("")
	const [displayMode, setDisplayMode] = useState<
		"original" | "translated" | "combined"
	>("original")

	// 获取歌曲详情
	useEffect(() => {
		if (!songId) {
			router.push("/")
			return
		}

		const fetchSongDetails = async () => {
			setIsLoading(true)
			try {
				// 获取歌曲详情
				const detailsResponse = await fetch(`/api/music/details?id=${songId}`)
				const detailsData: SongRoot = await detailsResponse.json()

				if (!detailsResponse.ok) {
					toast.error(`获取歌曲详情失败: ${detailsData.message || "未知错误"}`)
					return
				}

				setSongDetails(detailsData.songs[0])

				// 获取歌词
				const lyricsResponse = await fetch(`/api/music/lyrics?id=${songId}`)
				const lyricsData: LyricRoot = await lyricsResponse.json()

				if (!lyricsResponse.ok) {
					toast.error(`获取歌词失败: ${lyricsData.message || "未知错误"}`)
				}

				const lyricText = lyricsData.lrc?.lyric || "暂无歌词"
				const translatedText = lyricsData.tlyric?.lyric || ""

				setTranslatedLyrics(translatedText)

				// 初始化编辑状态
				setEditedOriginalLyrics(lyricText)
				setEditedTranslatedLyrics(translatedText)

				toast.success(`已加载"${detailsData.songs[0].name}"的详细信息`)
			} catch (error) {
				console.error("获取歌曲详情失败:", error)
				toast.error("获取歌曲详情失败，请检查网络连接")
			} finally {
				setIsLoading(false)
			}
		}

		fetchSongDetails()
	}, [songId, router])

	// 下载封面图片
	const handleDownloadCover = (songName: string, imageUrl: string) => {
		try {
			downloadImage(`${songName}-封面.jpg`, imageUrl)
			toast.success(`封面图片下载成功`)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "封面图片下载失败")
		}
	}

	// 下载歌词
	const handleDownloadLyrics = (songName: string, type: string) => {
		try {
			downloadLyrics(
				songName,
				type,
				editedOriginalLyrics,
				editedTranslatedLyrics
			)
			toast.success(`歌词已保存为${type}格式`)
		} catch (error) {
			toast.error(
				`歌词保存失败: ${error instanceof Error ? error.message : "未知错误"}`
			)
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-4">
				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center text-xl font-semibold hover:opacity-80 transition-opacity">
						<span className="mr-2">🎵</span>
						<span>音乐歌词编辑工具</span>
					</Link>
					<Link href="/">
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-1">
							返回首页
						</Button>
					</Link>
				</div>

				<Card className="overflow-hidden border-none shadow-none">
					<div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg">
						<div className="w-full md:w-1/3">
							<Skeleton className="aspect-square w-full rounded-md" />
							<Skeleton className="h-8 mt-4 w-4/5" />
							<Skeleton className="h-5 mt-2 w-3/5" />
							<Skeleton className="h-4 mt-2 w-2/3" />

							<div className="mt-6 space-y-2">
								<div className="flex gap-2">
									<Skeleton className="h-9 flex-1" />
									<Skeleton className="h-9 flex-1" />
								</div>
								<Skeleton className="h-9 w-full" />
								<Skeleton className="h-9 w-full mt-4" />
							</div>
						</div>

						<div className="w-full md:w-2/3">
							<div className="flex justify-between items-center mb-4">
								<Skeleton className="h-7 w-20" />
								<div className="flex space-x-4">
									<Skeleton className="h-5 w-20" />
									<Skeleton className="h-5 w-20" />
									<Skeleton className="h-5 w-20" />
								</div>
							</div>

							<div className="mb-4">
								<Skeleton className="h-10 w-full" />
							</div>

							<Skeleton className="h-[500px] w-full" />
						</div>
					</div>
				</Card>
			</div>
		)
	}

	if (!songDetails) {
		return (
			<div className="container mx-auto py-6 px-4">
				<div className="mb-6 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center text-xl font-semibold hover:opacity-80 transition-opacity">
						<span className="mr-2">🎵</span>
						<span>音乐歌词编辑工具</span>
					</Link>
					<Link href="/">
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
								<polyline points="9 22 9 12 15 12 15 22"></polyline>
							</svg>
							返回首页
						</Button>
					</Link>
				</div>

				<Card className="overflow-hidden border-none shadow-none">
					<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
						<div className="text-6xl mb-4">😕</div>
						<h3 className="text-xl font-semibold mb-2">未找到歌曲</h3>
						<p className="text-gray-500 mb-6">该歌曲可能不存在或已被删除</p>
						<Link href="/">
							<Button>返回首页</Button>
						</Link>
					</div>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-6 px-4">
			<div className="mb-6 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center text-xl font-semibold hover:opacity-80 transition-opacity">
					<span className="mr-2">🎵</span>
					<span>音乐歌词编辑工具</span>
				</Link>
				<Link href="/">
					<Button variant="ghost" size="sm" className="flex items-center gap-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
							<polyline points="9 22 9 12 15 12 15 22"></polyline>
						</svg>
						返回首页
					</Button>
				</Link>
			</div>

			<Card className="overflow-hidden border-none shadow-none">
				<div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg">
					<div className="w-full md:w-1/3">
						<div className="bg-gray-100 p-1 rounded-md overflow-hidden shadow-md">
							<img
								src={songDetails.album?.picUrl}
								alt={songDetails.album?.name}
								className="w-full h-auto object-cover rounded-md"
							/>
						</div>
						<h1 className="text-2xl font-bold mt-4">{songDetails.name}</h1>
						<p className="text-gray-600">
							{songDetails.artists
								?.map((artist: Artist) => artist.name)
								.join(", ")}
						</p>
						<p className="text-gray-500 mt-1">
							专辑：{songDetails.album?.name}
						</p>

						<div className="mt-6 space-y-2">
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDownloadLyrics(songDetails.name, "lrc")}
									className="flex-1 hover:bg-slate-100">
									下载歌词(lrc)
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDownloadLyrics(songDetails.name, "srt")}
									className="flex-1 hover:bg-slate-100">
									下载歌词(srt)
								</Button>
							</div>
							<Button
								size="sm"
								onClick={() =>
									handleDownloadCover(
										songDetails.name,
										songDetails.album?.picUrl
									)
								}
								className="w-full">
								下载封面图片
							</Button>
							<Link href="/">
								<Button variant="outline" className="w-full">
									返回首页
								</Button>
							</Link>
						</div>
					</div>

					<div className="w-full md:w-2/3">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">歌词</h3>
							<RadioGroup
								className="flex flex-row items-center space-x-4"
								value={displayMode}
								onValueChange={(
									value: "original" | "translated" | "combined"
								) => setDisplayMode(value)}>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="original" id="r-original" />
									<Label htmlFor="r-original">原歌词</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="translated"
										id="r-translated"
										disabled={!translatedLyrics}
									/>
									<Label htmlFor="r-translated">翻译歌词</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="combined"
										id="r-combined"
										disabled={!translatedLyrics}
									/>
									<Label htmlFor="r-combined">融合显示</Label>
								</div>
							</RadioGroup>
						</div>

						<Tabs defaultValue="edit">
							<TabsList className="grid w-full grid-cols-2 mb-4">
								<TabsTrigger value="edit">编辑</TabsTrigger>
								<TabsTrigger value="preview">预览</TabsTrigger>
							</TabsList>

							<TabsContent value="edit">
								<div className="flex flex-col">
									{displayMode === "combined" ? (
										<div>
											<p className="text-sm font-medium mb-1">
												融合歌词 (原歌词和翻译):
											</p>
											<Textarea
												className="max-h-[500px] min-h-[500px] text-sm"
												value={combineDisplayLyrics(
													editedOriginalLyrics,
													editedTranslatedLyrics
												)}
												onChange={(e) => {
													const { original, translated } =
														separateCombinedLyrics(e.target.value)
													setEditedOriginalLyrics(original)
													setEditedTranslatedLyrics(translated)
												}}
												placeholder={!translatedLyrics ? "暂无翻译歌词" : ""}
												disabled={!translatedLyrics}
											/>
											<p className="text-xs text-gray-500 mt-1">
												提示: 时间戳和原歌词一行，翻译歌词在下一行
											</p>
										</div>
									) : (
										<Textarea
											className="max-h-[500px] min-h-[500px] text-sm"
											value={
												displayMode === "original"
													? editedOriginalLyrics
													: editedTranslatedLyrics
											}
											onChange={(e) => {
												if (displayMode === "original") {
													setEditedOriginalLyrics(e.target.value)
												} else if (displayMode === "translated") {
													setEditedTranslatedLyrics(e.target.value)
												}
											}}
											placeholder={
												displayMode === "translated" && !translatedLyrics
													? "暂无翻译歌词"
													: ""
											}
											disabled={
												displayMode === "translated" && !translatedLyrics
											}
										/>
									)}
								</div>
							</TabsContent>

							<TabsContent value="preview">
								<div className="border rounded-md p-4 h-[500px] overflow-y-auto">
									<div className="text-sm whitespace-pre-line">
										{displayMode === "combined" ? (
											<div>
												{combineDisplayLyrics(
													editedOriginalLyrics,
													editedTranslatedLyrics
												)
													.split("\n")
													.map((line, i, lines) => (
														<div
															key={i}
															className={
																!line.match(/\[\d+:\d+\.\d+\]/) &&
																i > 0 &&
																lines[i - 1]?.match(/\[\d+:\d+\.\d+\]/)
																	? "pl-4 text-gray-500"
																	: ""
															}>
															{line}
														</div>
													))}
											</div>
										) : (
											<div>
												{(displayMode === "original"
													? formatLyrics(editedOriginalLyrics)
													: formatLyrics(editedTranslatedLyrics)
												)
													.split("\n")
													.map((line, i) => (
														<div key={i}>{line}</div>
													))}
											</div>
										)}
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</Card>
		</div>
	)
}
