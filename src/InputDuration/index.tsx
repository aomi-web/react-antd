import React, {useState} from 'react';
import {InputNumber, InputNumberProps, Select, SelectProps, Space} from "antd";
import dayjs from "dayjs";
import * as duration from 'dayjs/plugin/duration'

dayjs.extend(duration as any)

export type Unit = 'days' | 'weeks' | 'months' | 'years' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'

export type Duration = {
  value?: number | string,
  /**
   * 默认值为 D
   */
  unit?: Unit
}

export type InputDurationProps = {
  /**
   * SpaceCompactProps 属性
   */
  spaceCompactProps?: React.ComponentProps<typeof Space.Compact>

  /**
   * 数字输入库属性
   */
  inputNumberProps?: InputNumberProps<any>

  selectProps?: SelectProps

  /**
   * 值
   */
  value?: number | string
  defaultValue?: number | string

  /**
   * 单位
   */
  defaultUnit?: Unit

  /**
   * 值变更
   * @param value
   */
  onChange?: (value?: string) => void

  [key: string]: any
};

const options: SelectProps['options'] = [
  {
    label: '天',
    value: 'days'
  }, {
    label: '周',
    value: 'weeks'
  }, {
    label: '月',
    value: 'months'
  }, {
    label: '年',
    value: 'years'
  }, {
    label: '时',
    value: 'hours'
  }, {
    label: '分',
    value: 'minutes'
  }, {
    label: '秒',
    value: 'seconds'
  }, {
    label: '毫秒',
    value: 'milliseconds'
  }
]

export const units: Unit[] = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds']

const transform: Record<Unit, string> = {
  days: "asDays",
  hours: "asHours",
  milliseconds: "asMilliseconds",
  minutes: "asMinutes",
  months: "asMonths",
  seconds: "asSeconds",
  weeks: "asWeeks",
  years: "asYears"
}

/**
 *
 * @param value
 */
export function parse(value: string): [number, Unit] {
  const v: any = dayjs.duration(value);
  const unit = units.find(key => {
    return 0 != v.$d[key];
  }) ?? 'days'

  return [v[transform[unit]]?.(), unit]
}

/**
 * 转换成字符串
 * @param number 数字
 * @param unit 单位
 */
export function toDurationString(number: number, unit: Unit): string {
  // return dayjs.duration(number, unit).toISOString();
  return `PT${dayjs.duration(number, unit).asHours()}H`;
}

export function InputDuration(props: InputDurationProps) {
  const {
    value,
    onChange,
    defaultValue,
    defaultUnit,
    spaceCompactProps,
    inputNumberProps,
    selectProps,
    disabled,
    className,
  } = props;

  let initNumber: any = undefined, initUnit = defaultUnit ?? 'days';
  if (typeof value === 'string') {
    const [v, u] = parse(value);
    initNumber = v
    initUnit = u
  } else if (typeof defaultValue === 'string') {
    const [v, u] = parse(defaultValue);
    initNumber = v
    initUnit = u
  }

  const [number, setNumber] = useState(initNumber)
  const [unit, setUnit] = useState(initUnit)

  const triggerChange = (changeValue: any) => {
    // Should provide an event to pass value to Form.
    if (onChange) {
      const n = changeValue?.number ?? number;
      const u = changeValue?.unit ?? unit;
      if (n) {
        onChange(toDurationString(n, u));
      } else {
        onChange(undefined);
      }
    }
  };

  function handleNumberChange(number: number | null) {
    setNumber(number);
    triggerChange({
      number
    })
  }

  function handleUnitChange(u: Unit) {
    const newNumber = number ? (dayjs.duration(number, unit) as any)[transform[u]]() : number;
    setNumber(newNumber);
    setUnit(u)
    triggerChange({
      number: newNumber,
      unit: u
    })
  }

  return (
    <Space.Compact className={className} {...spaceCompactProps}>
      <InputNumber step={1}
                   style={{width: '75%'}}
                   {...inputNumberProps}
                   value={number}
                   onChange={handleNumberChange}
                   disabled={disabled}
      />
      <Select options={options}
              style={{width: '25%'}}
              {...selectProps}
              value={unit}
              onChange={handleUnitChange}
              disabled={disabled}
      />
    </Space.Compact>
  )
}
