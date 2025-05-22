// 格式化LRC文件内容为双语格式
export const formatLrcFile = (original: string, translated: string): string => {
	if (!translated) return original

	// 解析原歌词和翻译歌词，提取时间戳和文本
	const parseLines = (lyrics: string) => {
		const lines = lyrics.split("\n").filter((line) => line.trim() !== "")
		const result: { timeStr: string; text: string }[] = []

		for (const line of lines) {
			const timeMatches = Array.from(line.matchAll(/\[(\d+):(\d+)\.(\d+)\]/g))
			if (timeMatches.length === 0) continue // 跳过没有时间戳的行

			// 提取最后一个时间戳之后的文本部分
			const lastMatch = timeMatches[timeMatches.length - 1]
			const text = line.substring(lastMatch.index + lastMatch[0].length).trim()

			// 将所有时间戳与文本配对
			for (const match of timeMatches) {
				const timeStr = match[0]
				result.push({ timeStr, text })
			}
		}

		return result
	}

	const origLines = parseLines(original)
	const transLines = parseLines(translated)

	// 创建时间戳映射，用于匹配原文和翻译
	const timeMap = new Map()

	// 首先添加原文行到时间映射
	origLines.forEach((line) => {
		timeMap.set(line.timeStr, { original: line.text, translated: "" })
	})

	// 尝试匹配翻译行
	transLines.forEach((line) => {
		if (timeMap.has(line.timeStr)) {
			timeMap.get(line.timeStr).translated = line.text
		}
	})

	// 生成双语LRC
	const result: string[] = []
	timeMap.forEach((value, timeStr) => {
		result.push(`${timeStr}${value.original}`)
		if (value.translated) {
			result.push(`${timeStr}${value.translated}`)
		}
	})

	return result.join("\n")
}

// 格式化LRC文件内容为合并式双语格式（原文/翻译在同一行）
export const formatLrcFileMerged = (
	original: string,
	translated: string,
	separator: string = " / "
): string => {
	if (!translated) return original

	// 解析原歌词和翻译歌词，提取时间戳和文本
	const parseLines = (lyrics: string) => {
		const lines = lyrics.split("\n").filter((line) => line.trim() !== "")
		const result: { timeStr: string; text: string }[] = []

		for (const line of lines) {
			const timeMatches = Array.from(line.matchAll(/\[(\d+):(\d+)\.(\d+)\]/g))
			if (timeMatches.length === 0) continue // 跳过没有时间戳的行

			// 提取最后一个时间戳之后的文本部分
			const lastMatch = timeMatches[timeMatches.length - 1]
			const text = line.substring(lastMatch.index + lastMatch[0].length).trim()

			// 将所有时间戳与文本配对
			for (const match of timeMatches) {
				const timeStr = match[0]
				result.push({ timeStr, text })
			}
		}

		return result
	}

	const origLines = parseLines(original)
	const transLines = parseLines(translated)

	// 创建时间戳映射，用于匹配原文和翻译
	const timeMap = new Map()

	// 首先添加原文行到时间映射
	origLines.forEach((line) => {
		timeMap.set(line.timeStr, { original: line.text, translated: "" })
	})

	// 尝试匹配翻译行
	transLines.forEach((line) => {
		if (timeMap.has(line.timeStr)) {
			timeMap.get(line.timeStr).translated = line.text
		}
	})

	// 生成合并式双语LRC
	const result: string[] = []
	timeMap.forEach((value, timeStr) => {
		if (value.translated) {
			// 如果有翻译，合并原文和翻译
			result.push(`${timeStr}${value.original}${separator}${value.translated}`)
		} else {
			// 如果没有翻译，只使用原文
			result.push(`${timeStr}${value.original}`)
		}
	})

	return result.join("\n")
}

// 格式化SRT文件内容
export const formatSrtFile = (original: string, translated: string): string => {
	// 解析歌词行和时间戳
	const parseLrcLines = (lyrics: string) => {
		const lines = lyrics.split("\n").filter((line) => line.trim() !== "")
		const result: {
			timeMs: number // 毫秒时间戳，用于排序
			startTime: string
			text: string
		}[] = []

		for (const line of lines) {
			const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/)
			if (!match) continue

			const min = parseInt(match[1])
			const sec = parseInt(match[2])
			const ms = parseInt(match[3])
			const text = match[4].trim()

			// 计算总毫秒数用于排序
			const timeMs = min * 60000 + sec * 1000 + ms

			// 转换为标准SRT时间格式: 小时:分钟:秒,毫秒
			const startTime = `00:${min.toString().padStart(2, "0")}:${sec
				.toString()
				.padStart(2, "0")},${ms.toString().padStart(3, "0")}`

			result.push({
				timeMs,
				startTime,
				text,
			})
		}

		// 按时间排序
		return result.sort((a, b) => a.timeMs - b.timeMs)
	}

	const origEntries = parseLrcLines(original)
	const transEntries = parseLrcLines(translated)

	// 计算每个字幕条目的结束时间
	const processedEntries = origEntries.map((entry, index, array) => {
		let endTime: string

		if (index < array.length - 1) {
			// 如果不是最后一个条目，结束时间是下一个条目的开始时间
			endTime = array[index + 1].startTime
		} else {
			// 如果是最后一个条目，结束时间是开始时间加5秒
			const timeMs = entry.timeMs + 5000 // 加5秒
			const totalSeconds = Math.floor(timeMs / 1000)
			const hours = Math.floor(totalSeconds / 3600)
			const minutes = Math.floor((totalSeconds % 3600) / 60)
			const seconds = totalSeconds % 60
			const milliseconds = timeMs % 1000

			endTime = `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds
				.toString()
				.padStart(3, "0")}`
		}

		return {
			...entry,
			endTime,
		}
	})

	// 将翻译字幕与原文字幕匹配
	const subtitles: {
		index: number
		startTime: string
		endTime: string
		text: string
	}[] = []

	// 如果有翻译，创建双语字幕
	if (translated) {
		// 创建时间索引
		const transMap = new Map()
		transEntries.forEach((entry) => {
			transMap.set(entry.startTime, entry.text)
		})

		for (let i = 0; i < processedEntries.length; i++) {
			const orig = processedEntries[i]
			const trans = transMap.get(orig.startTime) || ""

			// 添加字幕条目
			subtitles.push({
				index: i + 1,
				startTime: orig.startTime,
				endTime: orig.endTime,
				text: trans ? `${orig.text}\n${trans}` : orig.text,
			})
		}
	} else {
		// 只有原文
		for (let i = 0; i < processedEntries.length; i++) {
			subtitles.push({
				index: i + 1,
				startTime: processedEntries[i].startTime,
				endTime: processedEntries[i].endTime,
				text: processedEntries[i].text,
			})
		}
	}

	// 生成SRT格式
	return subtitles
		.map(
			(sub) =>
				`${sub.index}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`
		)
		.join("\n")
}

// 格式化歌词显示（移除时间标记）
export const formatLyrics = (lyricText: string): string => {
	return lyricText
		.split("\n")
		.map((line) => {
			// 移除时间标记 [00:00.000]
			return line.replace(/\[\d+:\d+\.\d+\]/g, "")
		})
		.filter((line) => line.trim() !== "")
		.join("\n")
}

// 合并原歌词和翻译歌词为可显示的格式
export const combineDisplayLyrics = (
	original: string,
	translated: string
): string => {
	if (!translated) return original

	// 解析原歌词，提取时间戳和文本
	const parseLines = (lyrics: string) => {
		const lines = lyrics.split("\n").filter((line) => line.trim() !== "")
		const result: {
			time: number
			timeStr?: string
			text: string
			fullLine?: string
		}[] = []

		for (const line of lines) {
			const timeMatches = Array.from(line.matchAll(/\[(\d+):(\d+)\.(\d+)\]/g))
			if (timeMatches.length === 0) {
				// 如果没有时间戳，直接添加文本
				result.push({ time: -1, text: line.trim() })
				continue
			}

			// 提取最后一个时间戳之后的文本部分
			const lastMatch = timeMatches[timeMatches.length - 1]
			const text = line.substring(lastMatch.index + lastMatch[0].length).trim()

			// 将所有时间戳与文本配对
			for (const match of timeMatches) {
				const min = parseInt(match[1])
				const sec = parseInt(match[2])
				const ms = parseInt(match[3])
				const time = min * 60 + sec + ms / 1000
				result.push({ time, timeStr: match[0], text, fullLine: line })
			}
		}

		return result.sort((a, b) => a.time - b.time)
	}

	const origLines = parseLines(original)
	const transLines = parseLines(translated)

	// 将翻译行映射到最近的原歌词行
	const combinedLines = []

	for (const origLine of origLines) {
		if (origLine.time === -1) {
			// 没有时间戳的行，直接添加
			combinedLines.push(origLine.text)
			continue
		}

		// 查找时间最接近的翻译行
		let closestTransLine = null
		let minTimeDiff = Infinity

		for (const transLine of transLines) {
			if (transLine.time === -1) continue // 跳过没有时间戳的翻译行

			const timeDiff = Math.abs(transLine.time - origLine.time)
			if (timeDiff < minTimeDiff) {
				minTimeDiff = timeDiff
				closestTransLine = transLine
			}
		}

		// 创建融合行
		if (closestTransLine && minTimeDiff < 2) {
			// 允许2秒的误差
			// 使用原文的时间戳，后面接原文和翻译
			combinedLines.push(
				`${origLine.timeStr}${origLine.text}\n${closestTransLine.text}`
			)
		} else {
			// 没有找到匹配的翻译，只保留原文
			combinedLines.push(origLine.fullLine)
		}
	}

	return combinedLines.join("\n")
}

// 从合并显示的内容中分离原歌词和翻译歌词
export const separateCombinedLyrics = (
	combined: string
): { original: string; translated: string } => {
	const lines = combined.split("\n")
	let original = ""
	let translated = ""

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 检查是否包含时间戳
		const hasTimestamp = /\[\d+:\d+\.\d+\]/.test(line)

		if (
			hasTimestamp &&
			i + 1 < lines.length &&
			!/\[\d+:\d+\.\d+\]/.test(lines[i + 1])
		) {
			// 当前行有时间戳，下一行没有时间戳，说明这是一对翻译行
			original += line + "\n"
			translated += lines[i + 1] + "\n"
			i++ // 跳过下一行，因为已经处理了
		} else if (hasTimestamp) {
			// 只有时间戳的行，只添加到原歌词
			original += line + "\n"
		} else {
			// 没有时间戳的行，可能是单独的翻译行，添加到翻译歌词
			translated += line + "\n"
		}
	}

	return { original, translated }
}

// 下载歌词
export const downloadLyrics = (
	songName: string,
	type: string,
	original: string,
	translated: string,
	lrcFormat: "separated" | "merged" = "separated",
	separator: string = " / "
): void => {
	const element = document.createElement("a")

	let text = ""

	// 根据类型选择合适的格式
	if (type === "lrc") {
		// 根据选择的格式生成LRC
		text =
			lrcFormat === "merged"
				? formatLrcFileMerged(original, translated, separator)
				: formatLrcFile(original, translated)
	} else if (type === "srt") {
		text = formatSrtFile(original, translated)
	}

	const file = new Blob([text], { type: "text/plain" })
	element.href = URL.createObjectURL(file)
	element.download = `${songName}.${type}`
	document.body.appendChild(element)
	element.click()
	document.body.removeChild(element)
}

// 下载图片
export const downloadImage = (fileName: string, imageUrl: string): void => {
	// 创建一个隐形的a标签用于下载
	fetch(imageUrl)
		.then((response) => response.blob())
		.then((blob) => {
			const element = document.createElement("a")
			element.href = URL.createObjectURL(blob)
			element.download = fileName
			document.body.appendChild(element)
			element.click()
			document.body.removeChild(element)
		})
		.catch((error) => {
			console.error("下载图片失败:", error)
			alert("下载图片失败，请检查网络连接")
		})
}

// 格式化时间（毫秒转为分:秒）
export const formatDuration = (duration: number): string => {
	const minutes = Math.floor(duration / 1000 / 60)
	const seconds = Math.floor((duration / 1000) % 60)
	return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}
