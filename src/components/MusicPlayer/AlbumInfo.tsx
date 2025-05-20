import React from "react"

interface AlbumInfoProps {
	artist: string
	producer: string
	visualDesigner: string
	coverImage: string | null
	onProducerChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onVisualDesignerChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AlbumInfo({
	artist,
	producer,
	visualDesigner,
	coverImage,
	onProducerChange,
	onVisualDesignerChange,
}: AlbumInfoProps) {
	return (
		<div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-end">
			{/* 专辑封面 */}
			<div className="mb-8 w-full flex justify-end">
				<div className="relative">
					{coverImage ? (
						<img
							src={coverImage}
							alt="Album Cover"
							className="w-64 h-64 object-cover rounded-md shadow-lg"
						/>
					) : (
						<div className="w-64 h-64 bg-blue-800 flex items-center justify-center rounded-md shadow-lg">
							<span className="text-4xl">♪</span>
						</div>
					)}
				</div>
			</div>

			{/* 音符图标 */}
			<div className="text-4xl font-light mb-6">♪ Always</div>

			{/* 艺术家和专辑名 */}
			<div className="text-4xl font-bold mb-2">{artist || "未知艺术家"}</div>
			<div className="text-4xl font-light mb-12">Never Enough</div>

			{/* 制作信息 */}
			<div className="flex flex-col items-end space-y-4 w-full">
				<div className="flex flex-col items-end">
					<div className="text-xl font-light">Produced by</div>
					<input
						type="text"
						placeholder="输入制作人"
						value={producer}
						onChange={onProducerChange}
						className="text-3xl font-bold bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-right placeholder-white/40"
					/>
				</div>

				<div className="flex flex-col items-end">
					<div className="text-xl font-light">Lyrics by</div>
					<div className="text-3xl font-bold">
						{visualDesigner || "未知艺术家"}
					</div>
				</div>

				<div className="flex flex-col items-end">
					<div className="text-xl font-light">Visual Design</div>
					<input
						type="text"
						placeholder="输入视觉设计师"
						value={visualDesigner}
						onChange={onVisualDesignerChange}
						className="text-3xl font-bold bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-right placeholder-white/40"
					/>
				</div>
			</div>
		</div>
	)
}
