import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";

export const ProjectUuid = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const projectUuid =
      request.headers["x-project-uuid"] || request.headers["X-Project-UUID"];
    if (!projectUuid) {
      throw new BadRequestException("X-Project-UUID header is required");
    }
    return projectUuid;
  },
);
