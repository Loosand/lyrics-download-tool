/**
 * 解析LRC歌词内容
 * @param lrcContent LRC歌词内容
 * @returns 解析后的歌词数组
 */
export function parseLRC(lrcContent: string) {
	// 分割LRC内容为行
	const lines = lrcContent.trim().split(/\r?\n/)

	// 存储解析后的歌词
	const parsedLyrics: { start: number; end: number; text: string }[] = []

	// 处理每一行
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 匹配时间标签 [mm:ss.xx]
		const timeTagMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/)

		if (timeTagMatch) {
			const minutes = parseInt(timeTagMatch[1])
			const seconds = parseInt(timeTagMatch[2])
			const centiseconds = parseInt(timeTagMatch[3])
			const text = timeTagMatch[4].trim()

			// 计算开始时间（秒）
			const startTime = minutes * 60 + seconds + centiseconds / 100

			// 计算结束时间（如果有下一行歌词，则为下一行的开始时间，否则加5秒）
			let endTime = startTime + 5 // 默认显示5秒

			// 查找下一个有时间标签的行作为当前行的结束时间
			for (let j = i + 1; j < lines.length; j++) {
				const nextLine = lines[j]
				const nextTimeTagMatch = nextLine.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/)

				if (nextTimeTagMatch) {
					const nextMinutes = parseInt(nextTimeTagMatch[1])
					const nextSeconds = parseInt(nextTimeTagMatch[2])
					const nextCentiseconds = parseInt(nextTimeTagMatch[3])

					endTime = nextMinutes * 60 + nextSeconds + nextCentiseconds / 100
					break
				}
			}

			// 只添加有文本内容的歌词
			if (text) {
				parsedLyrics.push({
					start: startTime,
					end: endTime,
					text,
				})
			}
		}
	}

	// 按开始时间排序
	return parsedLyrics.sort((a, b) => a.start - b.start)
}
