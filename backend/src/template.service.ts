import { Injectable } from "@nestjs/common";
import { readFile } from "fs/promises";
import { join } from "path";
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  async renderTemplate(
    templateName: string,
    context: object
  ): Promise<string> {
    let template = this.templateCache.get(templateName);

    if (!template) {
      const templatePath = join(process.cwd(), 'templates', `${templateName}.hbs`);

      try {
        const templateSource = await readFile(templatePath, 'utf-8');
        template = handlebars.compile(templateSource);
        this.templateCache.set(templateName, template);
      } catch (error) {
        throw new Error(`Couldn't load template: ${templateName}`);
      }
    }

    return template(context);
  }
}