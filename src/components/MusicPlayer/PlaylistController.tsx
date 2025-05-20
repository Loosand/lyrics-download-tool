import { useState, useEffect, useCallback } from "react"

// 歌曲类型定义
export interface Song {
	id: string
	title: string
	artist?: string
	lrcFileName: string
	audioFileName: string
	coverImage?: string
}

export function usePlaylistController() {
	// 播放列表状态
	const [playlist, setPlaylist] = useState<Song[]>([])
	const [currentSongIndex, setCurrentSongIndex] = useState<number>(0)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [isInitialized, setIsInitialized] = useState<boolean>(false)

	// 加载播放列表
	useEffect(() => {
		const loadPlaylist = async () => {
			setIsLoading(true)
			try {
				// 从API加载播放列表
				const response = await fetch("/api/songs")

				if (!response.ok) {
					throw new Error("加载播放列表失败")
				}

				const data = await response.json()

				if (Array.isArray(data) && data.length > 0) {
					setPlaylist(data)
					// 如果是首次加载，设置当前歌曲为列表中的第一首
					if (!isInitialized) {
						setCurrentSongIndex(0)
						setIsInitialized(true)
					}
				} else {
					// 如果没有歌曲，使用默认歌曲
					const defaultSong = {
						id: "default",
						title: "示例歌曲",
						artist: "请上传音乐",
						lrcFileName: "default.lrc",
						audioFileName: "default.mp3",
						coverImage: "/music/covers/default.jpg",
					}

					setPlaylist([defaultSong])
					setCurrentSongIndex(0)
					setIsInitialized(true)
				}
			} catch (error) {
				console.error("加载播放列表失败:", error)
				// 设置默认播放列表
				const defaultSong = {
					id: "default",
					title: "示例歌曲",
					artist: "请上传音乐",
					lrcFileName: "default.lrc",
					audioFileName: "default.mp3",
					coverImage: "/music/covers/default.jpg",
				}

				setPlaylist([defaultSong])
				setCurrentSongIndex(0)
				setIsInitialized(true)
			} finally {
				setIsLoading(false)
			}
		}

		loadPlaylist()
	}, [isInitialized])

	// 添加歌曲到播放列表
	const addSong = useCallback((song: Song) => {
		setPlaylist((prev) => {
			const newPlaylist = [...prev, song]
			// 如果这是第一首歌，自动播放它
			if (
				prev.length === 0 ||
				(prev.length === 1 && prev[0].id === "default")
			) {
				setPlaylist([song]) // 替换默认歌曲
				setCurrentSongIndex(0)
				return [song]
			}
			return newPlaylist
		})
	}, [])

	// 从播放列表中移除歌曲
	const removeSong = useCallback(
		(songId: string) => {
			// 防止删除正在播放的歌曲
			if (playlist[currentSongIndex].id === songId) {
				return
			}

			setPlaylist((prev) => {
				const newPlaylist = prev.filter((song) => song.id !== songId)

				// 如果删除了当前索引之前的歌曲，需要调整currentSongIndex
				const removedBefore =
					prev.findIndex((song) => song.id === songId) < currentSongIndex
				if (removedBefore && currentSongIndex > 0) {
					setCurrentSongIndex(currentSongIndex - 1)
				}

				return newPlaylist
			})
		},
		[playlist, currentSongIndex]
	)

	// 播放下一首
	const playNext = useCallback(() => {
		if (playlist.length === 0) return
		setCurrentSongIndex((prev) => (prev + 1) % playlist.length)
	}, [playlist.length])

	// 播放上一首
	const playPrevious = useCallback(() => {
		if (playlist.length === 0) return
		setCurrentSongIndex(
			(prev) => (prev - 1 + playlist.length) % playlist.length
		)
	}, [playlist.length])

	// 播放指定歌曲
	const playSong = useCallback(
		(index: number) => {
			if (index >= 0 && index < playlist.length) {
				setCurrentSongIndex(index)
			}
		},
		[playlist.length]
	)

	// 获取当前播放的歌曲
	const currentSong = playlist[currentSongIndex]

	return {
		playlist,
		currentSong,
		currentSongIndex,
		isLoading,
		addSong,
		removeSong,
		playNext,
		playPrevious,
		playSong,
	}
}
