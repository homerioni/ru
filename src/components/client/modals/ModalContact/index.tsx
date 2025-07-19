'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@ui/Button';
import { FormEvent, useState } from 'react';
import s from './styles.module.scss';
import { postMessageTgBot } from '@/services/telegramBot';

type ModalContact = {
  closeAction: () => void;
};

export const ModalContact = ({ closeAction }: ModalContact) => {
  const [type, setType] = useState('Игрок');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    postMessageTgBot({
      type,
      name,
      contact,
      message,
    }).finally(() => closeAction());
  };

  return (
    <Modal closeHandler={closeAction}>
      <h3 className={s.title}>Оставить заявку на участие</h3>
      <form className={s.form} onSubmit={onSubmit}>
        <div className={s.radioWrapper}>
          <p className={s.labelName}>Игрок или команда? *</p>
          <label className={s.labelRadio}>
            <input
              type="radio"
              name="who"
              value="Игрок"
              defaultChecked
              onChange={() => setType('Игрок')}
            />
            <span className={s.radioButton} />
            <span>Игрок</span>
          </label>
          <label className={s.labelRadio}>
            <input
              type="radio"
              name="who"
              value="Команда"
              onChange={() => setType('Команда')}
            />
            <span className={s.radioButton} />
            <span>Команда</span>
          </label>
        </div>
        <label className={s.label}>
          <p className={s.labelName}>Ваше имя *</p>
          <div className={s.inputWrapper}>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </label>
        <label className={s.label}>
          <p className={s.labelName}>
            Контакт для связи (telegram, номер или любая соц сеть) *
          </p>
          <div className={s.inputWrapper}>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
        </label>
        <label className={s.labelMessage}>
          <p className={s.labelName}>Комментарий по желанию</p>
          <div className={s.message}>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </label>
        <div className={s.buttonWrapper}>
          <Button type="submit">Отправить</Button>
        </div>
      </form>
    </Modal>
  );
};
