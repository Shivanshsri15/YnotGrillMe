import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ENTRY_PRESETS } from '../../shared/constants/entry.constants.ts';
import { VisitorRole } from '../../shared/enums.ts';

@Controller({ path: 'entry', version: '1' })
export class EntryController {
  @Get()
  listRoles() {
    return {
      items: Object.values(ENTRY_PRESETS),
    };
  }

  @Get(':role')
  getRolePreset(@Param('role') role: string) {
    const normalized = role.toLowerCase() as VisitorRole;
    const preset = ENTRY_PRESETS[normalized];
    if (!preset) {
      throw new NotFoundException(
        `Unknown visitor role "${role}". Use hiring, engineer, or exploring.`,
      );
    }
    return preset;
  }
}
