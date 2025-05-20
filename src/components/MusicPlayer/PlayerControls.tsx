import React from "react"
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	SkipBack,
	SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlayerControlsProps {
	isPlaying: boolean
	currentTime: number
	duration: number
	volume: number
	isMuted: boolean
	isLoaded: boolean
	togglePlay: () => void
	handleVolumeChange: (value: number[]) => void
	toggleMute: () => void
	handleSeek: (value: number[]) => void
	formatTime: (time: number) => string
}

export function PlayerControls({
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
}: PlayerControlsProps) {
	return (
		<div className="mt-auto pt-8">
			{/* 进度条 */}
			<div className="flex items-center gap-2 mb-4">
				<span className="text-sm text-white/70">{formatTime(currentTime)}</span>
				<input
					type="range"
					value={currentTime}
					min={0}
					max={duration || 100}
					step={0.1}
					onChange={(e) => handleSeek([parseFloat(e.target.value)])}
					disabled={!isLoaded}
					className="flex-grow h-2 appearance-none bg-white/20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
				/>
				<span className="text-sm text-white/70">{formatTime(duration)}</span>
			</div>

			{/* 控制按钮 */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					className="text-white/70 hover:text-white hover:bg-white/10">
					<SkipBack size={24} />
				</Button>

				<Button
					variant="outline"
					size="icon"
					onClick={togglePlay}
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
					className="text-white/70 hover:text-white hover:bg-white/10">
					<SkipForward size={24} />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={toggleMute}
					className="text-white/70 hover:text-white hover:bg-white/10">
					{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
				</Button>

				<input
					type="range"
					value={isMuted ? 0 : volume}
					min={0}
					max={1}
					step={0.01}
					onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
					className="w-24 h-2 appearance-none bg-white/20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
				/>
			</div>
		</div>
	)
}
