import React from "react"

interface LyricsViewProps {
	title: string
	albumTitle: string
	currentLyric: string
	isLyricsLoaded: boolean
	onAlbumTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function LyricsView({
	title,
	albumTitle,
	currentLyric,
	isLyricsLoaded,
	onAlbumTitleChange,
}: LyricsViewProps) {
	return (
		<div className="flex-grow flex flex-col">
			<h1 className="text-6xl font-bold mb-4">{title || "未知歌曲"}</h1>
			{/* 中文标题或翻译 */}
			<input
				type="text"
				placeholder="输入中文标题（可选）"
				value={albumTitle}
				onChange={onAlbumTitleChange}
				className="text-4xl font-bold mb-12 bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-2 placeholder-white/40"
			/>

			{/* 当前歌词段落标记 */}
			<div className="text-2xl font-light mb-4">(Verse)</div>

			{/* 歌词显示 */}
			<div className="text-4xl font-bold space-y-6">
				{currentLyric || (isLyricsLoaded ? "" : "加载歌词中...")}
			</div>
		</div>
	)
}
