import {ReactNode, useState} from 'react';
import logo from './assets/images/logo-universal.png';
import './App.css';
import {TimedShutdown} from '../wailsjs/go/main/App'
import {Button, Col, DatePicker, Form, InputNumber, Modal, notification, Row, Select} from 'antd';
import dayjs from 'dayjs';
import type {DatePickerProps} from 'antd/es/date-picker';
import {IconType} from "antd/es/notification/interface";

function App() {
    const [mode, changeMode] = useState("countdown");
    const [timeUint, changeTimeUint] = useState('minute');
    const [countdown, setCountdown] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState<ReactNode>();
    const [showCountdown, setShowCountdown] = useState(false);
    const [intervalId, setIntervalId] = useState<number>();

    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);

    // let interval: number

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        let cd = countdown.valueOf()
        const intervalId = setInterval(() => {
            if (cd <= 0) {
                clearInterval(intervalId)
                TimedShutdown().then(res => {
                    if (!res.success) {
                        openNotification('error', res.msg)
                    }
                })
                setShowCountdown(false)
            }
            const h = cd / 3600
            const hour = Math.trunc(h)
            let hs = 0
            if (hour > 0) {
                hs = (hour * 3600)
            }
            const m = (cd - hs) / 60
            const minute = Math.trunc(m)

            let useUpSecond = 0
            if (hour > 0) {
                useUpSecond += (hour * 3600)
            }
            if (minute > 0) {
                useUpSecond += (minute * 60)
            }
            const second = cd - useUpSecond
            setHour(hour)
            setMinute(minute)
            setSecond(second)
            cd--
            console.log(cd)
        }, 1000)
        setIntervalId(intervalId)
        setShowCountdown(true)
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const disabledDate: DatePickerProps['disabledDate'] = (current) => {
        // Can not select days before today
        return current <= dayjs().subtract(1, 'day');
    };

    const selectAfter = (
        <Select
            defaultValue={timeUint}
            style={{width: 60}}
            onChange={changeTimeUint}
            options={[
                {
                    value: 'second',
                    label: '秒',
                },
                {
                    value: 'minute',
                    label: '分',
                },
                {
                    value: 'hour',
                    label: '时',
                },
            ]}
        />
    );

    const onFinish = (values: any) => {
        switch (values.mode) {
            case 'date':
                setModalContext(<p>确定 <span
                    style={{color: 'red'}}>{values.date?.format('YYYY-MM-DD HH:mm')}</span> 关闭电脑吗？</p>)
                const duration = dayjs(values.date).diff(dayjs(), 'seconds')
                if (duration <= 0) {
                    openNotification('error', '所选时间必须大于当前时间！')
                    return;
                }
                setCountdown(duration)
                break
            case 'countdown':
                values['timeUint'] = timeUint
                let timeUintCn = '秒'
                switch (timeUint) {
                    case 'second':
                        timeUintCn = '秒'
                        setCountdown(values.time)
                        break
                    case 'minute':
                        timeUintCn = '分钟'
                        setCountdown(values.time * 60)
                        break
                    case 'hour':
                        timeUintCn = '小时'
                        setCountdown(values.time * 60 * 60)
                        break
                }
                setModalContext(<p>确定 <span style={{color: 'red'}}>{values.time} {timeUintCn}</span> 后关闭电脑吗？
                </p>)
                break
            default:
                return
        }
        showModal()
    };

    const onFinishFailed = (errorInfo: any): void => {
        console.log('Failed:', errorInfo);
    };

    const openNotification = (type: IconType, message: string) => {
        notification.open({
            message: message,
            type: type,
        });
    };

    const handleCountdownCancel = () => {
        setShowCountdown(false)
        clearInterval(intervalId)
    }

    return (
        <div id="App">
            <img src={logo} id="logo" alt="logo"/>
            <div id="input" className="input-box">

                <Row>
                    <Col span={4}>

                    </Col>
                    <Col span={24}>
                        <div className={'content'}>
                            {
                                showCountdown ?
                                    <div>
                                        <span>关机倒计时： {hour} : {minute} : {second}</span>
                                        <br/>
                                        <Button type="primary" danger style={{marginTop: '0.5rem'}}
                                                onClick={handleCountdownCancel}>
                                            取消
                                        </Button>
                                    </div>
                                    :
                                    <Form
                                        name="basic"
                                        labelCol={{span: 8}}
                                        wrapperCol={{span: 16}}
                                        initialValues={{mode: 'countdown'}}
                                        layout={'inline'}
                                        onFinish={onFinish}
                                        onFinishFailed={onFinishFailed}
                                        autoComplete="off">
                                        <Form.Item
                                            label=""
                                            name="mode">
                                            <Select
                                                style={{width: 120}}
                                                onChange={changeMode}
                                                options={[
                                                    {
                                                        value: 'date',
                                                        label: '日期',
                                                    },
                                                    {
                                                        value: 'countdown',
                                                        label: '倒计时',
                                                    },
                                                ]}
                                            />
                                        </Form.Item>
                                        {mode === 'date' ?
                                            <Form.Item
                                                label=""
                                                name="date"
                                                rules={[{required: true, message: '请选择关机时间！'}]}>
                                                <DatePicker disabledDate={disabledDate} showTime allowClear
                                                            showNow={false}
                                                            format={'YYYY-MM-DD HH:mm'} style={{width: 200}}/>
                                            </Form.Item>
                                            :
                                            <Form.Item
                                                label=""
                                                name="time"
                                                rules={[{required: true, message: '请输入关机倒计时！'}]}>
                                                <InputNumber addonAfter={selectAfter} style={{width: 200}}
                                                             placeholder={'关机倒计时'}/>
                                            </Form.Item>
                                        }
                                        <Form.Item wrapperCol={{offset: 8, span: 16}}>
                                            <Button type="primary" htmlType="submit">
                                                定时关机
                                            </Button>
                                        </Form.Item>
                                    </Form>
                            }
                        </div>
                    </Col>
                    <Col span={4}>

                    </Col>
                </Row>
            </div>

            <Modal title="确认" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                {modalContext}
            </Modal>
        </div>
    )
}

export default App
