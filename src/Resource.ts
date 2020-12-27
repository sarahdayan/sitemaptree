import fs from 'fs';
import path from 'path';

import { leadingTrailingSeparators } from './utils';

const root = process.cwd();

function getDestinationPath(filePath: string) {
  const { dir, name } = path.parse(
    filePath.replace(leadingTrailingSeparators, '')
  );

  return `/${path
    .join(dir, name)
    .split(path.sep)
    .join('/')}/`;
}

function getFileData(filePath: string) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

export class Resource {
  /**
   * The path to the source file.
   */
  source: string;
  /**
   * The resource's destination path.
   */
  destination: string;
  /**
   * The resource's data.
   */
  data: string;

  constructor(source: string, destination: string, data: string) {
    this.source = source;
    this.destination = getDestinationPath(destination);
    this.data = data;
  }

  /**
   * Create a resource from a source file's path.
   *
   * @param sourcePath The path of the source file.
   * @param destinationPath The resource's destination path.
   */
  static createFromPath(sourcePath: string, destinationPath?: string) {
    return new Resource(
      sourcePath,
      destinationPath || sourcePath,
      getFileData(sourcePath)
    );
  }
}
