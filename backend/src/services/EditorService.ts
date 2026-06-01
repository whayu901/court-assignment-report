import { EditorRepository } from '@repositories/EditorRepository';
import { Editor } from '@shared/types';

export class EditorService {
  private editorRepo = new EditorRepository();

  async getAllEditors(): Promise<Editor[]> {
    return this.editorRepo.findAll();
  }

  async getEditorById(id: number): Promise<Editor> {
    const editor = await this.editorRepo.findById(id);
    if (!editor) throw new Error('Editor not found');
    return editor;
  }

  async createEditor(name: string, flatFeePerJob: number): Promise<Editor> {
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }
    if (flatFeePerJob <= 0) {
      throw new Error('Flat fee per job must be greater than 0');
    }

    return this.editorRepo.create(name, flatFeePerJob);
  }

  async updateAvailability(id: number, isAvailable: boolean): Promise<Editor> {
    await this.getEditorById(id); // Ensure editor exists
    await this.editorRepo.updateAvailability(id, isAvailable);
    return this.getEditorById(id);
  }
}
