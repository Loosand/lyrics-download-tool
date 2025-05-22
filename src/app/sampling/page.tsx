"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"

export default function Page() {
	const [audioFile1] = useState("/sampling/Nujabes - aruarian dance.flac")
	const [audioFile2] = useState(
		"/sampling/Laurindo Almeida - The Lamp Is Low.flac"
	)

	const [coverImage1] = useState("/sampling/Nujabes - aruarian dance.jpg")
	const [coverImage2] = useState(
		"/sampling/Laurindo Almeida - The Lamp Is Low.jpg"
	)

	const [isPlaying1, setIsPlaying1] = useState(false)
	const [isPlaying2, setIsPlaying2] = useState(false)
	const [bgColor1, setBgColor1] = useState("rgba(26, 26, 46, 0.8)")
	const [bgColor2, setBgColor2] = useState("rgba(22, 33, 62, 0.8)")

	const audio1Ref = useRef<HTMLAudioElement>(null)
	const audio2Ref = useRef<HTMLAudioElement>(null)
	const cover1Ref = useRef<HTMLDivElement>(null)
	const cover2Ref = useRef<HTMLDivElement>(null)
	const img1Ref = useRef<HTMLImageElement>(null)
	const img2Ref = useRef<HTMLImageElement>(null)

	// 计算图片的平均颜色
	const getAverageColor = (imgEl: HTMLImageElement): string => {
		const canvas = document.createElement("canvas")
		const context = canvas.getContext("2d")
		if (!context) return "rgba(26, 26, 46, 0.8)"

		const width = imgEl.naturalWidth || imgEl.width
		const height = imgEl.naturalHeight || imgEl.height

		// 使用较小的尺寸提高性能
		const blockSize = 5
		const sampleWidth = Math.floor(width / blockSize)
		const sampleHeight = Math.floor(height / blockSize)

		canvas.width = sampleWidth
		canvas.height = sampleHeight
		context.drawImage(imgEl, 0, 0, sampleWidth, sampleHeight)

		try {
			const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data
			let r = 0,
				g = 0,
				b = 0,
				count = 0

			for (let i = 0; i < data.length; i += 4) {
				r += data[i]
				g += data[i + 1]
				b += data[i + 2]
				count++
			}

			r = Math.floor(r / count)
			g = Math.floor(g / count)
			b = Math.floor(b / count)

			return `rgba(${r}, ${g}, ${b}, 0.85)`
		} catch (e) {
			console.error("获取图片颜色失败:", e)
			return "rgba(26, 26, 46, 0.8)"
		}
	}

	// 获取封面颜色
	useEffect(() => {
		const loadImage = (
			img: HTMLImageElement,
			setColor: (color: string) => void
		) => {
			if (img.complete) {
				setColor(getAverageColor(img))
			} else {
				img.onload = () => setColor(getAverageColor(img))
			}
		}

		if (img1Ref.current) {
			loadImage(img1Ref.current, setBgColor1)
		}

		if (img2Ref.current) {
			loadImage(img2Ref.current, setBgColor2)
		}
	}, [])

	// 初始化GSAP动画
	useEffect(() => {
		// 封面动画
		gsap.fromTo(
			[cover1Ref.current, cover2Ref.current],
			{ scale: 0.8, opacity: 0 },
			{
				scale: 1,
				opacity: 1,
				duration: 0.8,
				stagger: 0.2,
				ease: "back.out(1.7)",
			}
		)
	}, [])

	const togglePlay1 = () => {
		if (audio1Ref.current) {
			if (isPlaying1) {
				audio1Ref.current.pause()
				// 暂停封面动画
				gsap.to(cover1Ref.current, {
					scale: 1,
					filter: "brightness(1)",
					duration: 0.3,
					ease: "power2.out",
				})
			} else {
				audio1Ref.current.play()
				// 播放封面动画
				gsap.to(cover1Ref.current, {
					scale: 1.05,
					filter: "brightness(1.1)",
					duration: 0.3,
					ease: "power2.out",
				})
				// 播放这边时暂停另一边
				if (audio2Ref.current && isPlaying2) {
					audio2Ref.current.pause()
					setIsPlaying2(false)
					gsap.to(cover2Ref.current, {
						scale: 1,
						filter: "brightness(1)",
						duration: 0.3,
						ease: "power2.out",
					})
				}
			}
			setIsPlaying1(!isPlaying1)
		}
	}

	const togglePlay2 = () => {
		if (audio2Ref.current) {
			if (isPlaying2) {
				audio2Ref.current.pause()
				// 暂停封面动画
				gsap.to(cover2Ref.current, {
					scale: 1,
					filter: "brightness(1)",
					duration: 0.3,
					ease: "power2.out",
				})
			} else {
				audio2Ref.current.play()
				// 播放封面动画
				gsap.to(cover2Ref.current, {
					scale: 1.05,
					filter: "brightness(1.1)",
					duration: 0.3,
					ease: "power2.out",
				})
				// 播放这边时暂停另一边
				if (audio1Ref.current && isPlaying1) {
					audio1Ref.current.pause()
					setIsPlaying1(false)
					gsap.to(cover1Ref.current, {
						scale: 1,
						filter: "brightness(1)",
						duration: 0.3,
						ease: "power2.out",
					})
				}
			}
			setIsPlaying2(!isPlaying2)
		}
	}

	return (
		<div className="flex h-screen text-white">
			{/* 背景区域 */}
			<div className="absolute inset-0 flex">
				<div className="w-1/2 h-full" style={{ background: bgColor1 }} />
				<div className="w-1/2 h-full" style={{ background: bgColor2 }} />
			</div>

			{/* 左侧歌曲 - 绝对居中在左半边 */}
			<div className="absolute left-0 w-1/2 h-full flex items-center justify-center z-10">
				<div className="flex flex-col items-center">
					<div className="text-center mb-4">
						<h2 className="text-2xl font-bold mb-1">Nujabes</h2>
						<h3 className="text-xl opacity-80">aruarian dance</h3>
					</div>

					<div
						ref={cover1Ref}
						className="w-[20rem] h-[20rem] rounded-lg overflow-hidden cursor-pointer relative"
						onClick={togglePlay1}>
						<img
							ref={img1Ref}
							src={coverImage1}
							alt="Nujabes - aruarian dance"
							className="w-full h-full object-cover"
							crossOrigin="anonymous"
						/>
					</div>

					<audio ref={audio1Ref} src={audioFile1} />
				</div>
			</div>

			{/* 右侧歌曲 - 绝对居中在右半边 */}
			<div className="absolute right-0 w-1/2 h-full flex items-center justify-center z-10">
				<div className="flex flex-col items-center">
					<div className="text-center mb-4">
						<h2 className="text-2xl font-bold mb-1">Laurindo Almeida</h2>
						<h3 className="text-xl opacity-80">The Lamp Is Low</h3>
					</div>

					<div
						ref={cover2Ref}
						className="w-[20rem] h-[20rem] rounded-lg overflow-hidden cursor-pointer relative"
						onClick={togglePlay2}>
						<img
							ref={img2Ref}
							src={coverImage2}
							alt="Laurindo Almeida - The Lamp Is Low"
							className="w-full h-full object-cover"
							crossOrigin="anonymous"
						/>
					</div>

					<audio ref={audio2Ref} src={audioFile2} />
				</div>
			</div>
		</div>
	)
}
