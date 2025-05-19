"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
	Upload,
	Play,
	Pause,
	Volume2,
	VolumeX,
	SkipBack,
	SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { parseSRT } from "@/lib/srt-parser"

export default function ImmersiveMusicPlayer() {
	const [audioFile, setAudioFile] = useState<File | null>(null)
	const [audioUrl, setAudioUrl] = useState<string | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [volume, setVolume] = useState(0.7)
	const [isMuted, setIsMuted] = useState(false)
	const [metadata, setMetadata] = useState<{
		title?: string
		artist?: string
		cover?: string
		producer?: string
		visualDesigner?: string
	}>({})
	const [lyrics, setLyrics] = useState<
		{ start: number; end: number; text: string }[]
	>([])
	const [currentLyric, setCurrentLyric] = useState<string>("")
	const [albumTitle, setAlbumTitle] = useState<string>("")

	const audioRef = useRef<HTMLAudioElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const srtInputRef = useRef<HTMLInputElement>(null)

	// Handle audio file selection
	const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			setAudioFile(file)

			// Create object URL for the audio file
			const url = URL.createObjectURL(file)
			setAudioUrl(url)

			// Extract metadata from filename
			const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
			const parts = fileName.split(" - ")

			if (parts.length > 1) {
				setMetadata({
					artist: parts[0],
					title: parts[1],
					producer: "未知制作人",
					visualDesigner: "未知设计师",
				})
			} else {
				setMetadata({
					title: fileName,
					producer: "未知制作人",
					visualDesigner: "未知设计师",
				})
			}

			// Reset player state
			setCurrentTime(0)
			setIsPlaying(false)
			setCurrentLyric("")
		}
	}

	// Handle SRT file selection
	const handleSRTFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			const text = await file.text()
			const parsedLyrics = parseSRT(text)
			setLyrics(parsedLyrics)
		}
	}

	// Handle play/pause
	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause()
			} else {
				audioRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	// Handle volume change
	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0]
		setVolume(newVolume)
		if (audioRef.current) {
			audioRef.current.volume = newVolume
		}
		if (newVolume === 0) {
			setIsMuted(true)
		} else {
			setIsMuted(false)
		}
	}

	// Handle mute toggle
	const toggleMute = () => {
		if (audioRef.current) {
			if (isMuted) {
				audioRef.current.volume = volume
				setIsMuted(false)
			} else {
				audioRef.current.volume = 0
				setIsMuted(true)
			}
		}
	}

	// Handle time update
	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime)

			// Find current lyric
			const currentTime = audioRef.current.currentTime
			const currentLyricItem = lyrics.find(
				(lyric) => currentTime >= lyric.start && currentTime <= lyric.end
			)

			if (currentLyricItem) {
				setCurrentLyric(currentLyricItem.text)
			} else {
				setCurrentLyric("")
			}
		}
	}

	// Handle seeking
	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0]
			setCurrentTime(value[0])
		}
	}

	// Handle metadata loaded
	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration)
		}
	}

	// Format time in MM:SS
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
	}

	// Handle cover image upload
	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0]
			const url = URL.createObjectURL(file)
			setMetadata((prev) => ({ ...prev, cover: url }))
		}
	}

	// Handle album title input
	const handleAlbumTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAlbumTitle(e.target.value)
	}

	// Handle producer input
	const handleProducerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMetadata((prev) => ({ ...prev, producer: e.target.value }))
	}

	// Handle visual designer input
	const handleVisualDesignerChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setMetadata((prev) => ({ ...prev, visualDesigner: e.target.value }))
	}

	// Clean up object URLs when component unmounts
	useEffect(() => {
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl)
			}
			if (metadata.cover) {
				URL.revokeObjectURL(metadata.cover)
			}
		}
	}, [audioUrl, metadata.cover])

	return (
		<div className="relative w-full min-h-screen bg-blue-600 text-white overflow-hidden">
			{/* Main content */}
			<div className="relative flex flex-col md:flex-row h-screen">
				{/* Left section - Title and Lyrics */}
				<div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col">
					{/* Top controls */}
					<div className="mb-12 flex flex-wrap gap-4">
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							className="bg-white/10 border-white/20 hover:bg-white/20">
							<Upload size={16} className="mr-2" />
							选择音乐文件
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept="audio/*"
							onChange={handleAudioFileChange}
							className="hidden"
						/>

						<Button
							variant="outline"
							onClick={() => srtInputRef.current?.click()}
							className="bg-white/10 border-white/20 hover:bg-white/20"
							disabled={!audioFile}>
							<Upload size={16} className="mr-2" />
							导入歌词文件 (SRT)
						</Button>
						<input
							ref={srtInputRef}
							type="file"
							accept=".srt"
							onChange={handleSRTFileChange}
							className="hidden"
						/>
					</div>

					{/* Song title and lyrics */}
					<div className="flex-grow flex flex-col">
						{audioFile ? (
							<>
								<h1 className="text-6xl font-bold mb-4">
									{metadata.title || "未知歌曲"}
								</h1>
								{/* Chinese title or translation */}
								<input
									type="text"
									placeholder="输入中文标题（可选）"
									value={albumTitle}
									onChange={handleAlbumTitleChange}
									className="text-4xl font-bold mb-12 bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-2 placeholder-white/40"
								/>

								{/* Current verse marker */}
								<div className="text-2xl font-light mb-4">(Verse 1)</div>

								{/* Lyrics display */}
								<div className="text-4xl font-bold space-y-6">
									{currentLyric ||
										(lyrics.length > 0 ? "等待歌词..." : "没有歌词")}
								</div>
							</>
						) : (
							<div className="flex flex-col items-start justify-center h-full">
								<h1 className="text-6xl font-bold mb-4">沉浸式音乐播放器</h1>
								<p className="text-2xl font-light">请选择一个音乐文件开始</p>
							</div>
						)}
					</div>

					{/* Bottom controls */}
					<div className="mt-auto pt-8">
						{/* Progress bar */}
						<div className="flex items-center gap-2 mb-4">
							<span className="text-sm text-white/70">
								{formatTime(currentTime)}
							</span>
							<Slider
								value={[currentTime]}
								min={0}
								max={duration || 100}
								step={0.1}
								onValueChange={handleSeek}
								disabled={!audioFile}
								className="flex-grow"
							/>
							<span className="text-sm text-white/70">
								{formatTime(duration)}
							</span>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								disabled={!audioFile}
								className="text-white/70 hover:text-white hover:bg-white/10">
								<SkipBack size={24} />
							</Button>

							<Button
								variant="outline"
								size="icon"
								onClick={togglePlay}
								disabled={!audioFile}
								className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-white/20">
								{isPlaying ? (
									<Pause size={24} />
								) : (
									<Play size={24} className="ml-1" />
								)}
							</Button>

							<Button
								variant="ghost"
								size="icon"
								disabled={!audioFile}
								className="text-white/70 hover:text-white hover:bg-white/10">
								<SkipForward size={24} />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onClick={toggleMute}
								disabled={!audioFile}
								className="text-white/70 hover:text-white hover:bg-white/10">
								{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
							</Button>

							<Slider
								value={[isMuted ? 0 : volume]}
								min={0}
								max={1}
								step={0.01}
								onValueChange={handleVolumeChange}
								disabled={!audioFile}
								className="w-24"
							/>
						</div>
					</div>
				</div>

				{/* Right section - Album art and Info */}
				<div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-end">
					{audioFile ? (
						<>
							{/* Album art */}
							<div className="mb-8 w-full flex justify-end">
								<div className="relative">
									<label className="block cursor-pointer">
										{metadata.cover ? (
											<img
												src={metadata.cover}
												alt="Album Cover"
												className="w-64 h-64 object-cover rounded-md shadow-lg"
											/>
										) : (
											<div className="w-64 h-64 bg-blue-800 flex items-center justify-center rounded-md shadow-lg">
												<span className="text-4xl">♪</span>
											</div>
										)}
										<input
											type="file"
											accept="image/*"
											onChange={handleCoverImageChange}
											className="hidden"
										/>
									</label>
								</div>
							</div>

							{/* Music note icon */}
							<div className="text-4xl font-light mb-6">♪ Always</div>

							{/* Artist and album */}
							<div className="text-4xl font-bold mb-2">
								{metadata.artist || "未知艺术家"}
							</div>
							<div className="text-4xl font-light mb-12">Never Enough</div>

							{/* Production info */}
							<div className="flex flex-col items-end space-y-4 w-full">
								<div className="flex flex-col items-end">
									<div className="text-xl font-light">Produced by</div>
									<input
										type="text"
										placeholder="输入制作人"
										value={metadata.producer}
										onChange={handleProducerChange}
										className="text-3xl font-bold bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-right placeholder-white/40"
									/>
								</div>

								<div className="flex flex-col items-end">
									<div className="text-xl font-light">Lyrics by</div>
									<div className="text-3xl font-bold">
										{metadata.artist || "未知艺术家"}
									</div>
								</div>

								<div className="flex flex-col items-end">
									<div className="text-xl font-light">Visual Design</div>
									<input
										type="text"
										placeholder="输入视觉设计师"
										value={metadata.visualDesigner}
										onChange={handleVisualDesignerChange}
										className="text-3xl font-bold bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-right placeholder-white/40"
									/>
								</div>
							</div>
						</>
					) : (
						<div className="h-full flex flex-col items-end justify-center">
							<p className="text-2xl">上传音乐文件开始体验</p>
						</div>
					)}
				</div>
			</div>

			{/* Audio element */}
			<audio
				ref={audioRef}
				src={audioUrl || undefined}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={() => setIsPlaying(false)}
			/>
		</div>
	)
}
