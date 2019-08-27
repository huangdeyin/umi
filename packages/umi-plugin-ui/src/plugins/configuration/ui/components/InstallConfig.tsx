import React, { useEffect, useState, useContext, useRef } from 'react';
import cls from 'classnames';
import { Button, Form, message } from 'antd';
import Context from '../Context';
import configMapping from './ConfigItem';
import styles from './BasicConfig.module.less';

const InstallConfig = () => {
  const containerRef = useRef();
  const { api, theme } = useContext(Context);
  const { _ } = api;
  const [formData, setFormData] = useState([]);
  const [form] = Form.useForm();
  const themeCls = cls(styles.basicConfig, styles[`basicConfig-${theme}`]);

  const updateFormData = async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.config.project',
    });
    setFormData(data);
  };

  useEffect(() => {
    updateFormData();
  }, []);

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = async values => {
    if (Object.keys(values).length === 0) {
      return;
    }
    await api.callRemote({
      type: 'org.umi.config.project.edit',
      payload: values,
    });
    message.success('配置修改成功');
  };

  const groupedData = {};
  formData.forEach(item => {
    const { group } = item;
    if (!groupedData[group]) {
      groupedData[group] = [];
    }
    groupedData[group].push(item);
  });

  const getInitialValue = ({ value, default: defaultValue }) => {
    if (_.isPlainObject(value) && _.isPlainObject(defaultValue)) {
      return _.merge(defaultValue, value);
    }
    if (Array.isArray(value) && Array.isArray(defaultValue)) {
      return _.uniq(defaultValue.concat(value));
    }
    return value || defaultValue;
  };

  const arrayToObject = arr => {
    return arr.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.name]: getInitialValue({
          value: curr.value,
          default: curr.default,
        }),
      }),
      {},
    );
  };

  const initialValues = arrayToObject(formData);

  return (
    <>
      <div className={themeCls} ref={containerRef}>
        <div className={styles.form}>
          <div className={styles['basicConfig-header']}>
            <h2>UI 配置</h2>
          </div>
          {/* === start === */}
          <div>
            <Form
              layout="vertical"
              form={form}
              onFinish={handleFinish}
              // onFinishFailed={handleFinishFailed}
              initialValues={initialValues}
            >
              {Object.keys(groupedData).map(group => {
                return (
                  <div className={styles.group} key={group}>
                    <h2 id={group}>{group}</h2>
                    {groupedData[group].map(item => {
                      const ConfigItem = configMapping[item.type];
                      return <ConfigItem key={item.name} {...item} form={form} />;
                    })}
                  </div>
                );
              })}
            </Form>
          </div>
          {/* === end === */}
        </div>
      </div>
      <div className={styles['basicConfig-submit']}>
        <Button onClick={handleSubmit} style={{ marginRight: 24 }} type="primary">
          保存
        </Button>
      </div>
    </>
  );
};

export default InstallConfig;
