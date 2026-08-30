import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { COLORS } from "../constants/theme";

export function CalendarPicker({
  value,
  onChange,
  maximumDate,
}: {
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
}) {
  const defaultStyles = useDefaultStyles("light");

  return (
    <DateTimePicker
      mode="single"
      date={value}
      maxDate={maximumDate}
      onChange={({ date }) =>
        date && onChange(new Date(date as string | number | Date))
      }
      styles={{
        ...defaultStyles,
        selected: { backgroundColor: COLORS.brand.red },
        selected_label: { color: COLORS.brand.textPrimary },
        today: { borderWidth: 1, borderColor: COLORS.brand.red },
        today_label: { color: COLORS.brand.red },
      }}
    />
  );
}
