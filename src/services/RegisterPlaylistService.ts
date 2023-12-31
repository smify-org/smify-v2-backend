import AssignPlaylistMusicsDTO from "../dto/AssignPlaylistMusicsDTO"
import CreatePlaylistDTO from "../dto/CreatePlaylistDTO"
import { PlaylistRepository } from "../repositories/playlist.repository"

interface CreateData {
  playlist_name: string
  musicsIds: number[]
}

export default class RegisterPlaylistService {
  constructor(
    protected readonly playlistProfile: CreateData,
    protected readonly user_id: number,
  ) {}
  public async createPlaylist() {
    const playlistDTO = new CreatePlaylistDTO({
      playlist_name: this.playlistProfile.playlist_name,
      user_id: this.user_id,
    })
    console.log("[RegisterPlaylistService] - Criando playlist", playlistDTO)
    const playlistId = await PlaylistRepository.createPlaylist(playlistDTO)

    console.log("[RegisterPlaylistService] - Playlist criada", playlistId)

    console.log(
      "[RegisterPlaylistService] - Associando músicas à playlist",
      playlistId,
    )
    await PlaylistRepository.assignPlaylistMusics(
      new AssignPlaylistMusicsDTO({
        music_ids: this.playlistProfile.musicsIds,
        playlist_id: playlistId,
      }),
    )

    return playlistId
  }
}
