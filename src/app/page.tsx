"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
	useAudioController,
	useLyricsController,
	PlayerControls,
	AlbumInfo,
	LyricsView,
} from "@/components/MusicPlayer"

export default function ImmersiveMusicPlayer() {
	// 中文标题状态
	const [albumTitle, setAlbumTitle] = useState<string>("认识你之前")

	// 使用音频控制器Hook
	const {
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
	} = useAudioController()

	// 使用歌词控制器Hook
	const {
		lyrics,
		currentLyric,
		isLyricsLoaded,
		updateCurrentLyric,
		extractMetadataFromLyrics,
	} = useLyricsController()

	// 使用useCallback包装事件处理函数，避免不必要的重新创建
	const handleTimeUpdate = useCallback(
		(time: number) => {
			updateCurrentLyric(time)
		},
		[updateCurrentLyric]
	)

	// 将音频当前时间与歌词同步（只在wavesurfer首次加载时设置一次）
	useEffect(() => {
		if (wavesurfer) {
			// 添加事件监听
			wavesurfer.on("timeupdate", handleTimeUpdate)

			// 清理函数，组件卸载时移除监听
			return () => {
				wavesurfer.un("timeupdate", handleTimeUpdate)
			}
		}
	}, [wavesurfer, handleTimeUpdate])

	// 从歌词中提取元数据 - 仅在lyrics首次加载时执行一次
	useEffect(() => {
		if (lyrics.length > 0) {
			const { lyricist, composer } = extractMetadataFromLyrics()

			// 批量更新元数据，减少状态更新次数
			const updates: Record<string, string> = {}
			if (lyricist) updates.visualDesigner = lyricist
			if (composer) updates.producer = composer

			if (Object.keys(updates).length > 0) {
				updateMetadata(updates)
			}
		}
	}, [lyrics, extractMetadataFromLyrics, updateMetadata])

	// 使用useCallback包装处理函数，防止频繁重新创建
	const handleAlbumTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setAlbumTitle(e.target.value)
		},
		[]
	)

	const handleProducerChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateMetadata({ producer: e.target.value })
		},
		[updateMetadata]
	)

	const handleVisualDesignerChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateMetadata({ visualDesigner: e.target.value })
		},
		[updateMetadata]
	)

	// 使用useMemo创建传递给子组件的props，避免不必要的重新渲染
	const playerControlsProps = {
		isPlaying,
		currentTime,
		duration,
		volume,
		isMuted,
		isLoaded,
		togglePlay,
		handleVolumeChange,
		toggleMute,
		handleSeek,
		formatTime,
	}

	const lyricsViewProps = {
		title: metadata.title,
		albumTitle,
		currentLyric,
		isLyricsLoaded,
		onAlbumTitleChange: handleAlbumTitleChange,
	}

	const albumInfoProps = {
		artist: metadata.artist,
		producer: metadata.producer,
		visualDesigner: metadata.visualDesigner,
		coverImage,
		onProducerChange: handleProducerChange,
		onVisualDesignerChange: handleVisualDesignerChange,
	}

	return (
		<div className="relative w-full min-h-screen bg-blue-600 text-white overflow-hidden">
			{/* 浮动播放列表 */}

			{/* 主要内容 */}
			<div className="relative flex flex-col md:flex-row h-screen">
				{/* 左侧区域 - 标题和歌词 */}
				<div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col">
					{/* 歌曲标题和歌词 */}
					<LyricsView {...lyricsViewProps} />

					{/* 波形图 */}
					<div className="my-8">
						<div
							ref={waveformRef}
							className="w-full rounded-md overflow-hidden"></div>
					</div>

					{/* 底部控制区 */}
					<PlayerControls {...playerControlsProps} />
				</div>

				{/* 右侧区域 - 专辑封面和信息 */}
				<AlbumInfo {...albumInfoProps} />
			</div>
		</div>
	)
}
