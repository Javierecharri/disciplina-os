"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ICON_OPTIONS } from "@/constants/iconOptions";
import { getIcon } from "@/utils/icon";

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconSelect({ value, onChange, className }: IconSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger className={className}>
        <SelectValue>
          {(current: string | null) => {
            if (!current) return null;
            const Icon = getIcon(current);
            return (
              <span className="flex items-center gap-1.5">
                <Icon className="size-4" />
                {current}
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ICON_OPTIONS.map((name) => {
          const Icon = getIcon(name);
          return (
            <SelectItem key={name} value={name}>
              <Icon className="size-4" />
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
