import { Request, Response } from 'express';
import DataManager from '../model/dataManager';

export default class LanguageCOntroller {
  public static async getDefault(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getLanguages()));
  }
}
