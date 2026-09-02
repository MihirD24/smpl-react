export const palette = {
  primary: '#2563EB', primaryDark: '#1D4ED8', accent: '#14B8A6', success: '#16A34A', warning: '#F59E0B', danger: '#EF4444',
  light: { background:'#F6F8FC', surface:'#FFFFFF', surfaceMuted:'#F1F5F9', text:'#0F172A', textMuted:'#64748B', border:'#E2E8F0' },
  dark: { background:'#0B1220', surface:'#111827', surfaceMuted:'#1E293B', text:'#F8FAFC', textMuted:'#94A3B8', border:'#263244' },
};
export const spacing = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32 };
export const radius = { sm:10, md:14, lg:18, xl:24, pill:999 };
export const elevation = { shadowColor:'#0F172A', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:14, elevation:3 };
export const getTheme = (dark=false) => ({ ...palette, ...(dark ? palette.dark : palette.light) });
