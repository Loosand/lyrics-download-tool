## 搜索接口

```
curl --location --request GET 'https://music.163.com/api/search/get?s=陈奕迅&type=1&offset=0&limit=15' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)'
```

### 歌曲详情

```
curl --location --request GET 'https://music.163.com/api/song/detail?ids=1866481024' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)'
```

### 歌曲文件

```
curl --location --request GET 'https://music.163.com/song/media/outer/url?id=537407937.mp3' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)'
```

### 歌词（双语）

```
curl --location --request GET 'https://music.163.com/api/song/lyric?os=pc&id=537407937&lv=-1&tv=-1' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)'
```
