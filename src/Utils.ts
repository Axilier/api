import { format } from "date-fns";

export function getNeatDate() {
    const date = new Date();
    return format(date, "dd/MM/y HH:mm:ss");
}
