import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalSettings?: string;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.organizationSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.organizationSetting.create({
        data: { name: 'Athletix', theme: 'dark', generalSettings: '{}' },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.getSettings();
    return this.prisma.organizationSetting.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
