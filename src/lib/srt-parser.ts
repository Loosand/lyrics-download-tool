export function parseSRT(srtContent: string) {
	// Split the SRT content by double newline (which separates each subtitle)
	const subtitles = srtContent.trim().split(/\r?\n\r?\n/)

	const parsedSubtitles = subtitles
		.map((subtitle) => {
			// Split each subtitle into lines
			const lines = subtitle.split(/\r?\n/)

			// Skip the index (first line)
			// Parse the timestamp line (second line)
			const timestampLine = lines[1]
			const timestamps = timestampLine.match(
				/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
			)

			if (!timestamps) {
				return null
			}

			// Calculate start and end times in seconds
			const startHours = Number.parseInt(timestamps[1])
			const startMinutes = Number.parseInt(timestamps[2])
			const startSeconds = Number.parseInt(timestamps[3])
			const startMilliseconds = Number.parseInt(timestamps[4])

			const endHours = Number.parseInt(timestamps[5])
			const endMinutes = Number.parseInt(timestamps[6])
			const endSeconds = Number.parseInt(timestamps[7])
			const endMilliseconds = Number.parseInt(timestamps[8])

			const startTime =
				startHours * 3600 +
				startMinutes * 60 +
				startSeconds +
				startMilliseconds / 1000
			const endTime =
				endHours * 3600 + endMinutes * 60 + endSeconds + endMilliseconds / 1000

			// Join the remaining lines as the subtitle text
			const text = lines.slice(2).join(" ")

			return {
				start: startTime,
				end: endTime,
				text,
			}
		})
		.filter(Boolean) as { start: number; end: number; text: string }[]

	return parsedSubtitles
}
