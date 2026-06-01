import { Request, Response } from 'express';
import { EditorService } from '@services/EditorService';
import { CreateEditorRequest } from '@shared/types';

export class EditorController {
  private editorService = new EditorService();

  getAllEditors = async (req: Request, res: Response) => {
    try {
      const editors = await this.editorService.getAllEditors();
      res.json(editors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch editors' });
    }
  };

  getEditorById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const editor = await this.editorService.getEditorById(id);
      res.json(editor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch editor';
      res.status(404).json({ error: message });
    }
  };

  createEditor = async (req: Request, res: Response) => {
    try {
      const { name, flatFeePerJob } = req.body as CreateEditorRequest;
      const editor = await this.editorService.createEditor(name, flatFeePerJob);
      res.status(201).json(editor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create editor';
      res.status(400).json({ error: message });
    }
  };

  updateAvailability = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isAvailable } = req.body;
      const editor = await this.editorService.updateAvailability(id, isAvailable);
      res.json(editor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update availability';
      res.status(400).json({ error: message });
    }
  };
}
