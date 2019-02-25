declare function timestamp(pattern?: string | Date, date?: Date): string
declare function timestampUTC(pattern?: string | Date, date?: Date): string

export default timestamp
export { timestampUTC as utc };
