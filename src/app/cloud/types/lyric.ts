export interface Root {
	sgc: boolean
	sfy: boolean
	qfy: boolean
	transUser: TransUser
	lyricUser: LyricUser
	lrc: Lrc
	tlyric: Tlyric
	code: number
}

export interface TransUser {
	id: number
	status: number
	demand: number
	userid: number
	nickname: string
	uptime: number
}

export interface LyricUser {
	id: number
	status: number
	demand: number
	userid: number
	nickname: string
	uptime: number
}

export interface Lrc {
	version: number
	lyric: string
}

export interface Tlyric {
	version: number
	lyric: string
}
