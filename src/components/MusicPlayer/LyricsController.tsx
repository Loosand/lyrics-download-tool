import { useState, useEffect, useCallback } from "react"
import { parseLRC } from "@/lib/lrc-parser"

// 歌词控制器Hook
export function useLyricsController() {
	const [lyrics, setLyrics] = useState<
		{ start: number; end: number; text: string }[]
	>([])
	const [currentLyric, setCurrentLyric] = useState<string>("")
	const [isLyricsLoaded, setIsLyricsLoaded] = useState(false)
	const [lyricsPath, setLyricsPath] = useState<string>("/music/Like You.lrc")

	// 加载LRC歌词文件
	useEffect(() => {
		loadLyricsFile(lyricsPath)
	}, [lyricsPath])

	// 加载LRC歌词文件的方法
	const loadLyricsFile = useCallback(async (path: string) => {
		setIsLyricsLoaded(false)
		setLyricsPath(path)

		try {
			const response = await fetch(path)
			const text = await response.text()
			const parsedLyrics = parseLRC(text)
			setLyrics(parsedLyrics)
			setIsLyricsLoaded(true)
		} catch (error) {
			console.error("加载歌词文件失败:", error)
			setLyrics([])
			setIsLyricsLoaded(true) // 即使失败也标记为已加载
		}
	}, [])

	// 更新当前歌词
	const updateCurrentLyric = useCallback(
		(currentTime: number) => {
			const currentLyricItem = lyrics.find(
				(lyric) => currentTime >= lyric.start && currentTime <= lyric.end
			)

			if (currentLyricItem) {
				setCurrentLyric(currentLyricItem.text)
			} else {
				setCurrentLyric("")
			}
		},
		[lyrics]
	)

	// 提取元数据信息（作词作曲等）
	const extractMetadataFromLyrics = useCallback(() => {
		if (lyrics.length > 0) {
			const metadataInfo = {
				lyricist: "",
				composer: "",
			}

			// 尝试从歌词的前几行提取作词作曲信息
			const lyricInfo = lyrics.slice(0, 5)

			lyricInfo.forEach((item) => {
				if (item.text.includes("作词:") || item.text.includes("作词：")) {
					metadataInfo.lyricist = item.text.replace(/作词[:：]\s*/, "").trim()
				}

				if (item.text.includes("作曲:") || item.text.includes("作曲：")) {
					metadataInfo.composer = item.text.replace(/作曲[:：]\s*/, "").trim()
				}
			})

			return metadataInfo
		}

		return { lyricist: "", composer: "" }
	}, [lyrics])

	return {
		lyrics,
		currentLyric,
		isLyricsLoaded,
		updateCurrentLyric,
		extractMetadataFromLyrics,
		loadLyricsFile,
	}
}
