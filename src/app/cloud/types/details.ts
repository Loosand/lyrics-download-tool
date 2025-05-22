/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Root {
	songs: Song[]
	equalizers: object
	code: number
	message: string
}

export interface Song {
	name: string
	id: number
	position: number
	alias: any[]
	status: number
	fee: number
	copyrightId: number
	disc: string
	no: number
	artists: Artist[]
	album: Album
	starred: boolean
	popularity: number
	score: number
	starredNum: number
	duration: number
	playedNum: number
	dayPlays: number
	hearTime: number
	sqMusic: SqMusic
	hrMusic: HrMusic
	ringtone: string
	crbt: any
	audition: any
	copyFrom: string
	commentThreadId: string
	rtUrl: any
	ftype: number
	rtUrls: any[]
	copyright: number
	transName: any
	sign: any
	mark: number
	originCoverType: number
	originSongSimpleData: any
	single: number
	noCopyrightRcmd: any
	hMusic: HMusic
	mMusic: MMusic
	lMusic: LMusic
	bMusic: BMusic
	mvid: number
	rtype: number
	rurl: any
	mp3Url: any
}

export interface Artist {
	name: string
	id: number
	picId: number
	img1v1Id: number
	briefDesc: string
	picUrl: string
	img1v1Url: string
	albumSize: number
	alias: any[]
	trans: string
	musicSize: number
	topicPerson: number
}

export interface Album {
	name: string
	id: number
	type: string
	size: number
	picId: number
	blurPicUrl: string
	companyId: number
	pic: number
	picUrl: string
	publishTime: number
	description: string
	tags: string
	company: string
	briefDesc: string
	artist: Artist2
	songs: any[]
	alias: any[]
	status: number
	copyrightId: number
	commentThreadId: string
	artists: Artist3[]
	subType: string
	transName: any
	onSale: boolean
	mark: number
	gapless: number
	dolbyMark: number
	picId_str: string
}

export interface Artist2 {
	name: string
	id: number
	picId: number
	img1v1Id: number
	briefDesc: string
	picUrl: string
	img1v1Url: string
	albumSize: number
	alias: any[]
	trans: string
	musicSize: number
	topicPerson: number
}

export interface Artist3 {
	name: string
	id: number
	picId: number
	img1v1Id: number
	briefDesc: string
	picUrl: string
	img1v1Url: string
	albumSize: number
	alias: any[]
	trans: string
	musicSize: number
	topicPerson: number
}

export interface SqMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}

export interface HrMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}

export interface HMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}

export interface MMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}

export interface LMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}

export interface BMusic {
	name: any
	id: number
	size: number
	extension: string
	sr: number
	dfsId: number
	bitrate: number
	playTime: number
	volumeDelta: number
}
