import type { Department } from '@/types/database'

// ============================================================
// CAMPUSCONNECT — DEPARTMENT CONSTANTS
// Mirrors supabase/seed.sql exactly.
// Used in signup form dropdowns and validation.
// ============================================================

export const DEPARTMENTS = [
  {
    name: 'Faculty of Management & Commerce',
    code: 'MNC',
    max_semesters: 6,
    programs: ['B.Com', 'BBA'],
  },
  {
    name: 'Faculty of Arts, Social Sciences & Humanities',
    code: 'ASH',
    max_semesters: 6,
    programs: ['BA'],
  },
  {
    name: 'Faculty of Sciences',
    code: 'SCI',
    max_semesters: 6,
    programs: ['B.Sc'],
  },
  {
    name: 'Faculty of Agriculture Sciences',
    code: 'AGR',
    max_semesters: 8,
    programs: ['B.Sc Agriculture'],
  },
  {
    name: 'Faculty of Education',
    code: 'EDU',
    max_semesters: 4,
    programs: ['B.Ed'],
  },
  {
    name: 'Faculty of Engineering & Technology',
    code: 'ENG',
    max_semesters: 8,
    programs: ['B.Tech'],
  },
  {
    name: 'Faculty of Ayurveda',
    code: 'AYU',
    max_semesters: 10,
    programs: ['BAMS'],
  },
  {
    name: 'Faculty of Medical & Paramedical Sciences',
    code: 'MED',
    max_semesters: 6,
    programs: ['Paramedical'],
  },
  {
    name: 'Faculty of Nursing',
    code: 'NUR',
    max_semesters: 8,
    programs: ['B.Sc Nursing'],
  },
  {
    name: 'Faculty of IT',
    code: 'ITS',
    max_semesters: 8,
    programs: ['BCA', 'B.Tech IT'],
  },
] as const satisfies readonly Pick<Department, 'name' | 'code' | 'max_semesters' | 'programs'>[]

export type DepartmentName = (typeof DEPARTMENTS)[number]['name']

/**
 * Returns an array of semester numbers [1, 2, ..., max_semesters]
 * for the given department name.
 */
export function getSemesterOptions(departmentName: string): number[] {
  const dept = DEPARTMENTS.find((d) => d.name === departmentName)
  if (!dept) return []
  return Array.from({ length: dept.max_semesters }, (_, i) => i + 1)
}

/**
 * Returns the list of programs offered by a department.
 */
export function getPrograms(departmentName: string): string[] {
  const dept = DEPARTMENTS.find((d) => d.name === departmentName)
  if (!dept) return []
  return [...dept.programs]
}
