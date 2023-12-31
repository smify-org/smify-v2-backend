import bcryptjs from "bcryptjs"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import Utils from "../utils"
import CreateUserProfileService from "../services/CreateUserProfileService"
import { UserRepository } from "../repositories/user.repository"

export default class UsersController {
  private userId!: number
  constructor(
    private readonly req: Request,
    private readonly res: Response,
  ) {
    if (this.req.signedCookies.token) {
      const token = jwt.verify(
        this.req.signedCookies.token,
        process.env.SECRET as string,
      ) as { id: number }
      this.userId = parseInt(token.id.toString())
    }
  }

  getUsersList = async () => {
    const response = await UserRepository.listUsers()

    this.res.status(200).json(response)
  }

  getUserPlaylists = async () => {
    const response = await UserRepository.getUserPlaylists(this.userId)

    try {
      if (response) {
        this.res.status(200).json(response)
      } else {
        this.res.status(401).json({ message: "Erro ao procurar playlists" })
      }
    } catch (error) {
      this.res.status(422).json(error)
    }
  }

  getUserProfile = async () => {
    try {
      const service = new CreateUserProfileService(this.userId)

      const response = await service.createUserProfile()

      return this.res.status(200).json(response)
    } catch (error) {
      return this.res.status(422).json({ message: error })
    }
  }

  createUser = async () => {
    try {
      if (!Utils.validadeEmail(this.req.body.email))
        throw new Error("Email inválido")

      await UserRepository.createUsers(this.req.body)

      return this.res
        .status(200)
        .json({ message: "Usuario criado com sucesso" })
    } catch (error) {
      return this.res
        .status(422)
        .json({ message: error instanceof Error ? error.message : error })
    }
  }

  loginUser = async () => {
    try {
      const response = await UserRepository.LoginUsers(this.req.body)

      const comparePassword = bcryptjs.compareSync(
        this.req.body.password,
        response[0].password,
      )

      if (!comparePassword) throw new Error()

      const jwtToken = jwt.sign(
        { id: response[0].id },
        process.env.SECRET as string,
        {
          expiresIn: "1d",
        },
      )

      return this.res
        .cookie("token", jwtToken, {
          httpOnly: true,
          signed: true,
          sameSite: "none",
          secure: true,
        })
        .send()
    } catch {
      return this.res.status(422).json({ message: "Email ou senha incorretos" })
    }
  }

  getFavoriteMusics = async () => {
    try {
      const response = await UserRepository.getFavoriteMusics(this.userId)

      return this.res.status(200).json(response)
    } catch (error) {
      return this.res.status(422).json({ message: error })
    }
  }
}
