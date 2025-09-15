import { Injectable } from '@nestjs/common';
import { exec as cpExec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(cpExec);

@Injectable()
export class ExecService {
  /**
   * Выполняет команду в указанной директории и возвращает stdout и stderr
   * @param command команда для выполнения, например "npm run lint"
   * @param cwd рабочая директория, абсолютный или относительный путь
   */
  async run(
    command: string,
    cwd: string,
  ): Promise<{ stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await exec(command, { cwd });
      return { stdout, stderr };
    } catch (error: any) {
      // Если ошибка, отдаем также вывод
      throw new Error(
        `Command failed: ${error.cmd}\nExit code: ${error.code}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`,
      );
    }
  }
}
