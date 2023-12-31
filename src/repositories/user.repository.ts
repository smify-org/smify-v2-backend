import bcryptjs from "bcryptjs"
import PlaylistEntity from "../entities/PlaylistEntity"
import UserEntity, { UserFavoriteMusicsEntity } from "../entities/UserEntity"
import { executeQuery } from "../models/connection"
import MusicEntity from "../entities/MusicEntity"

export class UserRepository {
  static async listUsers() {
    const query = "SELECT * FROM users"
    const response = await executeQuery(query)

    return response as UserEntity[]
  }

  static async getUserPlaylists(user_id: number) {
    const playlists = (await executeQuery(
      `
        SELECT P.* FROM playlists AS P 
        INNER JOIN user_playlists AS UP ON UP.playlist_id = P.id 
        WHERE UP.user_id = $1
        `,
      [user_id],
    )) as PlaylistEntity[]

    return playlists
  }

  static async createUsers(user: UserEntity): Promise<UserEntity[]> {
    try {
      console.log("user", user)
      const hashPassword = bcryptjs.hashSync(user.password, 10)

      const query =
        "INSERT INTO users(name, icon_name, email, password) VALUES($1,$2,$3,$4)"
      const values = [user.name, user.icon_name, user.email, hashPassword]
      const response = await executeQuery(query, values)

      return response as UserEntity[]
    } catch (error) {
      console.log(error)
      throw new Error("Email já existente")
    }
  }

  static async getUserFavoriteMusics(user_id: number, music_id: number) {
    const query =
      "SELECT * FROM user_favorite_musics WHERE user_id = $1 AND favorite_music_id = $2"
    const response: UserFavoriteMusicsEntity[] = await executeQuery(query, [
      user_id,
      music_id,
    ])

    return response
  }

  static async LoginUsers(user: UserEntity): Promise<UserEntity[]> {
    const query = "SELECT * FROM users WHERE email = $1"
    const values = [user.email]
    const response = await executeQuery(query, values)

    return response as UserEntity[]
  }

  static async getUser(userId: number) {
    const result = (await executeQuery(
      "SELECT * FROM users AS U WHERE id = $1",
      [userId],
    )) as UserEntity[]
    return result[0]
  }

  static async getFavoriteMusics(user_id: number) {
    const query = "SELECT * FROM user_favorite_musics WHERE user_id = $1"
    const values = [user_id]
    const response = await executeQuery(query, values)

    return response as MusicEntity[]
  }
}