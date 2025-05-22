"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Root as SearchRoot, Song } from "./cloud/types/search"
import {
	Root as SongRoot,
	Song as SongDetail,
	Artist,
} from "./cloud/types/details"
import { Root as LyricRoot } from "./cloud/types/lyric"
import {
	formatLyrics,
	combineDisplayLyrics,
	separateCombinedLyrics,
	downloadLyrics,
	downloadImage,
	formatDuration,
} from "@/lib/lyrics"
import Link from "next/link"

// 搜索参数组件
function SearchParamsHandler() {
	const searchParams = useSearchParams()
	const initialKeyword = searchParams.get("q") || ""
	const initialSongId = searchParams.get("id")
		? Number(searchParams.get("id"))
		: null

	return (
		<PageContent
			initialKeyword={initialKeyword}
			initialSongId={initialSongId}
		/>
	)
}

// 定义PageContent组件的props类型
interface PageContentProps {
	initialKeyword: string
	initialSongId: number | null
}

// 主要内容组件
function PageContent({ initialKeyword, initialSongId }: PageContentProps) {
	const router = useRouter()

	const [searchKeyword, setSearchKeyword] = useState(initialKeyword)
	const [searchResults, setSearchResults] = useState<Song[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)
	const [songDetails, setSongDetails] = useState<SongDetail | null>(null)
	const [translatedLyrics, setTranslatedLyrics] = useState<string>("")
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editedOriginalLyrics, setEditedOriginalLyrics] = useState<string>("")
	const [editedTranslatedLyrics, setEditedTranslatedLyrics] =
		useState<string>("")
	const [displayMode, setDisplayMode] = useState<
		"original" | "translated" | "combined"
	>("original")

	// 添加搜索锁，防止短时间内重复搜索
	const searchLockRef = useRef(false)
	// 添加初始加载标记
	const isInitialLoadRef = useRef(true)

	// 初始加载时，如果URL中有搜索参数则执行搜索
	useEffect(() => {
		// 只在初始加载时执行搜索，忽略URL参数变化导致的重新渲染
		if (isInitialLoadRef.current) {
			if (initialKeyword) {
				handleSearch(initialKeyword, true)
			}

			// 如果URL中有id参数，则直接打开歌曲详情
			if (initialSongId) {
				handleGetSongDetails(initialSongId)
			}

			isInitialLoadRef.current = false
		}
	}, [initialKeyword, initialSongId])

	// 搜索歌曲
	const handleSearch = async (
		keyword = searchKeyword,
		isInitialSearch = false
	) => {
		if (!keyword.trim()) return

		// 防止重复搜索
		if (searchLockRef.current && !isInitialSearch) {
			toast.warning("搜索操作过于频繁，请稍后再试")
			return
		}

		// 设置搜索锁
		searchLockRef.current = true
		setTimeout(() => {
			searchLockRef.current = false
		}, 1000) // 1秒内不允许重复搜索

		if (!isInitialSearch) {
			// 更新URL参数，但不触发导航
			const params = new URLSearchParams()
			params.set("q", keyword)
			router.push(`/?${params.toString()}`, { scroll: false })
		}

		setIsLoading(true)
		setHasSearched(true)

		try {
			const response = await fetch(
				`/api/music/search?keyword=${encodeURIComponent(keyword)}&limit=15`
			)
			const data: SearchRoot = await response.json()

			if (!response.ok) {
				// 处理非200状态码
				if (response.status === 429) {
					toast.error("搜索频率过高，请稍后再试")
				} else {
					toast.error(`搜索失败: ${data.message || "未知错误"}`)
				}
				return
			}

			// 处理picId字段，减1后再设置到state
			const processedSongs =
				data.result?.songs?.map((song) => {
					// 创建song对象的深拷贝
					return {
						...song,
						album: {
							...song.album,
							picId: Number(song.album.picId) - 1,
						},
					}
				}) || []

			console.log("data.result?.songs", data.result?.songs)
			console.log("processedSongs", processedSongs)

			setSearchResults(processedSongs)

			if (processedSongs.length > 0) {
				toast.success(`成功找到 ${processedSongs.length} 首歌曲`)
			} else {
				toast.info("未找到相关歌曲，请尝试其他关键词")
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "搜索失败")
		} finally {
			setIsLoading(false)
		}
	}

	// 获取歌曲详情
	const handleGetSongDetails = async (songId: number) => {
		try {
			const detailsResponse = await fetch(`/api/music/details?id=${songId}`)
			const detailsData: SongRoot = await detailsResponse.json()

			if (!detailsResponse.ok) {
				toast.error(`获取歌曲详情失败: ${detailsData.message || "未知错误"}`)
				return
			}

			// 处理歌曲详情中的picId
			const processedSongDetail = {
				...detailsData.songs[0],
				album: detailsData.songs[0].album
					? {
							...detailsData.songs[0].album,
							picId: Number(detailsData.songs[0].album.picId) - 1,
					  }
					: null,
			}

			setSongDetails(processedSongDetail as SongDetail)

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

			setDialogOpen(true)
			toast.success(`已加载"${detailsData.songs[0].name}"的详细信息`)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "获取歌曲详情失败")
		}
	}

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

	// 渲染骨架屏
	const renderSkeletons = () => {
		return Array(8)
			.fill(0)
			.map((_, index) => (
				<Card key={index} className="overflow-hidden py-0 h-full flex flex-col">
					<Skeleton className="aspect-square w-full" />
					<CardContent className="flex-1 flex flex-col p-4 pt-3">
						<Skeleton className="h-6 w-full mb-2" />
						<Skeleton className="h-4 w-3/4 mb-2" />
						<Skeleton className="h-3 w-1/2 mb-1" />
						<Skeleton className="h-3 w-1/4 mb-3" />
						<div className="mt-auto pt-3">
							<Skeleton className="h-8 w-full" />
						</div>
					</CardContent>
				</Card>
			))
	}

	// 渲染空结果UI
	const renderEmptyResults = () => {
		return (
			<div className="text-center py-10">
				<div className="text-6xl mb-4">🔍</div>
				<h3 className="text-xl font-semibold mb-2">没有找到相关歌曲</h3>
				<p className="text-gray-500 mb-6">尝试不同的关键词或检查拼写</p>
				<Button
					onClick={() => {
						setSearchKeyword("")
						router.push("/", { scroll: false })
					}}>
					返回首页
				</Button>
			</div>
		)
	}

	// 渲染首页介绍内容
	const renderIntroduction = () => {
		return (
			<div>
				<div className="max-w-4xl mx-auto text-center mb-10">
					<h1 className="text-4xl font-bold mb-4">音乐歌词编辑工具</h1>
					<p className="text-xl text-gray-600">
						搜索、获取、编辑和下载您喜欢的音乐和歌词
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
					<Card>
						<CardHeader>
							<div className="text-3xl mb-2">🔍</div>
							<CardTitle>搜索音乐</CardTitle>
							<CardDescription>
								输入歌曲名称或歌手，快速查找喜爱的音乐
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								我们的搜索引擎可以帮助您快速找到想要的歌曲，支持模糊搜索和歌手名搜索。
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="text-3xl mb-2">✏️</div>
							<CardTitle>编辑歌词</CardTitle>
							<CardDescription>查看和修改原文歌词和翻译歌词</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								支持编辑原文歌词和翻译歌词，可以单独编辑或使用融合模式同时编辑双语歌词。
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="text-3xl mb-2">💾</div>
							<CardTitle>下载资源</CardTitle>
							<CardDescription>下载歌词文件和专辑封面</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600">
								将编辑好的歌词下载为LRC或SRT格式，支持双语字幕。也可以下载高清专辑封面图片。
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<>
			<header className="border-b sticky top-0 bg-white z-10">
				<div className="container flex items-center mx-auto py-3 px-4">
					<div className="hidden mx-auto md:flex flex-1 max-w-md">
						<Input
							type="text"
							placeholder="输入歌曲名称或歌手"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault()
									e.stopPropagation()
									handleSearch()
								}
							}}
							className="flex-1"
						/>
						<Button
							onClick={() => handleSearch()}
							disabled={isLoading}
							className="ml-2">
							{isLoading ? "搜索中..." : "搜索"}
						</Button>
					</div>

					<a
						href="https://github.com/Loosand/lyrics-download-tool"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center hover:text-blue-600 transition-colors">
						<svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
							<path
								fill="currentColor"
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
				</div>
			</header>

			<div className="container mx-auto py-6 px-4">
				<div className="md:hidden flex gap-2 mb-6">
					<Input
						type="text"
						placeholder="输入歌曲名称或歌手"
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault()
								e.stopPropagation()
								handleSearch()
							}
						}}
						className="flex-1"
					/>
					<Button onClick={() => handleSearch()} disabled={isLoading}>
						{isLoading ? "搜索中..." : "搜索"}
					</Button>
				</div>

				{/* 不同状态下的显示内容 */}
				{!hasSearched ? (
					// 首页介绍内容
					<div className="mt-52">{renderIntroduction()}</div>
				) : isLoading ? (
					// 搜索加载中显示骨架屏
					<Card>
						<CardHeader>
							<CardTitle>搜索结果</CardTitle>
							<CardDescription>
								正在搜索 &quot;{searchKeyword}&quot;...
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{renderSkeletons()}
							</div>
						</CardContent>
					</Card>
				) : searchResults.length > 0 ? (
					// 搜索结果
					<Card>
						<CardHeader>
							<CardTitle>搜索结果</CardTitle>
							<CardDescription>
								&quot;{searchKeyword}&quot; 找到 {searchResults.length} 首歌曲
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{searchResults.map((song) => (
									<Card
										key={song.id}
										className="overflow-hidden py-0 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
										<div className="aspect-square overflow-hidden">
											<img
												src={`https://p1.music.126.net/dlsDdLopwJrE8JlWgWbaOA==/${
													Number(song.album.picId) - 1
												}.jpg`}
												alt={song.album.name}
												className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
												onError={(e) => {
													e.currentTarget.src =
														"https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg"
												}}
											/>
										</div>
										<CardContent className="flex-1 flex flex-col p-4 pt-0">
											<h3
												className="font-semibold text-lg line-clamp-1 mt-2"
												title={song.name}>
												{song.name}
											</h3>
											<p
												className="text-sm text-gray-500 line-clamp-1"
												title={song.artists
													.map((artist) => artist.name)
													.join(", ")}>
												{song.artists.map((artist) => artist.name).join(", ")}
											</p>
											<p
												className="text-xs text-gray-400 mt-1 line-clamp-1"
												title={song.album.name}>
												专辑：{song.album.name}
											</p>
											<p className="text-xs text-gray-400 mt-1">
												{formatDuration(song.duration)}
											</p>
											<div className="mt-auto pt-3 space-y-2">
												<Button
													variant="outline"
													size="sm"
													className="w-full hover:bg-slate-100"
													onClick={() => handleGetSongDetails(song.id)}>
													查看详情
												</Button>
												<Link href={`/song/${song.id}`} className="block">
													<Button
														variant="outline"
														size="sm"
														className="w-full hover:bg-slate-100">
														在新页面打开
													</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				) : (
					// 空搜索结果
					renderEmptyResults()
				)}

				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-auto">
						{songDetails && (
							<>
								<DialogHeader>
									<DialogTitle className="text-xl">
										{songDetails.name}
									</DialogTitle>
									<DialogDescription>
										{songDetails.artists
											?.map((artist: Artist) => artist.name)
											.join(", ")}{" "}
										- {songDetails.album?.name}
									</DialogDescription>
								</DialogHeader>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
									<div>
										<div className="rounded-md overflow-hidden shadow-md">
											<img
												src={songDetails.album?.picUrl}
												alt={songDetails.album?.name}
												className="w-full h-auto object-cover"
											/>
										</div>
										<div className="flex gap-2 mt-4">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleDownloadLyrics(songDetails.name, "lrc")
												}
												className="flex-1 hover:bg-slate-100">
												下载歌词(lrc)
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleDownloadLyrics(songDetails.name, "srt")
												}
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
											className="w-full mt-2">
											下载封面图片
										</Button>

										{/* 歌曲详情页直接链接 */}
										<div className="mt-4">
											<Link href={`/song/${songDetails.id}`} className="w-full">
												<Button className="w-full bg-blue-600 hover:bg-blue-700">
													在新页面打开
												</Button>
											</Link>
										</div>
									</div>

									<div>
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
																className="max-h-[500px] text-sm"
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
																placeholder={
																	!translatedLyrics ? "暂无翻译歌词" : ""
																}
																disabled={!translatedLyrics}
															/>
															<p className="text-xs text-gray-500 mt-1">
																提示: 时间戳和原歌词一行，翻译歌词在下一行
															</p>
														</div>
													) : (
														<Textarea
															className="max-h-[500px] text-sm"
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
																displayMode === "translated" &&
																!translatedLyrics
																	? "暂无翻译歌词"
																	: ""
															}
															disabled={
																displayMode === "translated" &&
																!translatedLyrics
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
							</>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</>
	)
}

// 主导出组件，使用Suspense包裹SearchParamsHandler
export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto py-6 px-4">
					<div className="text-center py-10">
						<div className="animate-pulse h-6 w-1/3 bg-gray-200 rounded mx-auto mb-4"></div>
						<div className="animate-pulse h-4 w-1/4 bg-gray-200 rounded mx-auto"></div>
					</div>
				</div>
			}>
			<SearchParamsHandler />
		</Suspense>
	)
}
