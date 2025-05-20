import { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import * as musicMetadata from "music-metadata-browser"

// 音频控制器Hook
export function useAudioController(initialVolume: number = 0.7) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [volume, setVolume] = useState(initialVolume)
	const [isMuted, setIsMuted] = useState(false)
	const [isLoaded, setIsLoaded] = useState(false)
	const [coverImage, setCoverImage] = useState<string | null>(null)
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
	const [audioPath, setAudioPath] = useState<string>(
		"/music/国蛋 - Like You.mp3"
	)
	const [metadata, setMetadata] = useState<{
		title: string
		artist: string
		cover?: string
		producer: string
		visualDesigner: string
	}>({
		title: "Like You",
		artist: "国蛋",
		producer: "杨国隽",
		visualDesigner: "杨国隽",
	})

	const waveformRef = useRef<HTMLDivElement>(null)

	// 初始化 wavesurfer - 只在组件挂载时执行一次
	useEffect(() => {
		if (waveformRef.current && !wavesurfer) {
			const ws = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "white",
				progressColor: "#4F4A85",
				cursorColor: "#ffffff",
				barWidth: 2,
				barGap: 1,
				barRadius: 2,
				height: 60,
				normalize: true,
				minPxPerSec: 50,
				autoCenter: true,
				fillParent: true,
				hideScrollbar: true,
			})

			ws.load(audioPath)

			ws.on("ready", () => {
				setWavesurfer(ws)
				setDuration(ws.getDuration())
				setIsLoaded(true)
				ws.setVolume(volume)
			})

			// 只更新当前时间，不处理歌词
			ws.on("timeupdate", (time) => {
				setCurrentTime(time)
			})

			ws.on("finish", () => {
				setIsPlaying(false)
			})

			return () => {
				ws.destroy()
			}
		}
	}, [waveformRef, audioPath]) // 添加audioPath作为依赖项

	// 加载新的音频文件
	const loadAudio = (path: string) => {
		setAudioPath(path)

		// 如果wavesurfer已经初始化，直接加载新的音频
		if (wavesurfer) {
			setIsLoaded(false)
			setIsPlaying(false)
			wavesurfer.load(path)

			// 在音频准备好后更新状态
			wavesurfer.once("ready", () => {
				setDuration(wavesurfer.getDuration())
				setIsLoaded(true)
				setCurrentTime(0)
			})
		}

		// 加载音频元数据和封面
		loadAudioMetadata(path)
	}

	// 加载音频元数据和封面
	const loadAudioMetadata = async (path: string) => {
		try {
			// 获取音频文件
			const response = await fetch(path)
			const audioBlob = await response.blob()

			// 解析元数据
			const metadata = await musicMetadata.parseBlob(audioBlob)

			// 提取封面图片
			if (metadata.common.picture && metadata.common.picture.length > 0) {
				const picture = metadata.common.picture[0]
				const uint8Array = new Uint8Array(picture.data)
				const blob = new Blob([uint8Array], { type: picture.format })
				const imageUrl = URL.createObjectURL(blob)
				setCoverImage(imageUrl)
			} else {
				// 如果没有封面图片，使用默认封面
				setCoverImage("/music/covers/default.jpg")
			}

			// 提取其他元数据
			if (metadata.common.artist || metadata.common.title) {
				setMetadata((prev) => ({
					...prev,
					artist: metadata.common.artist || prev.artist,
					title: metadata.common.title || prev.title,
				}))
			}
		} catch (error) {
			console.error("获取音频元数据失败:", error)
			// 设置默认封面
			setCoverImage("/music/covers/default.jpg")
		}
	}

	// 单独处理音			量变化
	useEffect(() => {
		if (wavesurfer) {
			wavesurfer.setVolume(volume)
		}
	}, [volume, wavesurfer])

	// 加载初始音频元数据和封面
	useEffect(() => {
		loadAudioMetadata(audioPath)

		// 清理函数
		return () => {
			if (coverImage) {
				URL.revokeObjectURL(coverImage)
			}
		}
	}, []) // 仅在组件挂载时执行一次

	// 播放/暂停控制
	const togglePlay = () => {
		if (wavesurfer) {
			if (isPlaying) {
				wavesurfer.pause()
			} else {
				wavesurfer.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	// 音量控制
	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0]

		// 处理音量变化
		if (newVolume !== volume) {
			setVolume(newVolume)

			// 处理静音状态
			if (newVolume === 0 && !isMuted) {
				setIsMuted(true)
			} else if (newVolume > 0 && isMuted) {
				setIsMuted(false)
			}
		}
	}

	// 静音控制
	const toggleMute = () => {
		if (wavesurfer) {
			if (isMuted) {
				wavesurfer.setVolume(volume)
				setIsMuted(false)
			} else {
				wavesurfer.setVolume(0)
				setIsMuted(true)
			}
		}
	}

	// 进度控制
	const handleSeek = (value: number[]) => {
		if (wavesurfer) {
			wavesurfer.seekTo(value[0] / duration)
			setCurrentTime(value[0])
		}
	}

	// 格式化时间为 MM:SS
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
	}

	// 更新元数据
	const updateMetadata = (newData: Partial<typeof metadata>) => {
		setMetadata((prev) => ({ ...prev, ...newData }))
	}

	return {
		isPlaying,
		duration,
		currentTime,
		volume,
		isMuted,
		isLoaded,
		coverImage,
		wavesurfer,
		metadata,
		waveformRef,
		togglePlay,
		handleVolumeChange,
		toggleMute,
		handleSeek,
		formatTime,
		updateMetadata,
		loadAudio,
	}
}
