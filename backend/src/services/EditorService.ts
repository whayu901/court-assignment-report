import { EditorRepository } from '@repositories/EditorRepository';
import { Editor } from '@shared/types';

export class EditorService {
  private editorRepo = new EditorRepository();

  getAllEditors(): Editor[] {
    return this.editorRepo.findAll();
  }

  getEditorById(id: number): Editor {
    const editor = this.editorRepo.findById(id);
    if (!editor) throw new Error('Editor not found');
    return editor;
  }

  createEditor(name: string, flatFeePerJob: number): Editor {
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }
    if (flatFeePerJob <= 0) {
      throw new Error('Flat fee per job must be greater than 0');
    }

    return this.editorRepo.create(name, flatFeePerJob);
  }

  updateAvailability(id: number, isAvailable: boolean): Editor {
    this.getEditorById(id); // Ensure editor exists
    this.editorRepo.updateAvailability(id, isAvailable);
    return this.getEditorById(id);
  }
}
