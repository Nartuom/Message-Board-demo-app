import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Message, MessageClient, UUID, Visibility } from './MessageClient';

type Props = {
  messageClient: MessageClient;
};

type VisibilityFilter = 'all' | Visibility;

const App = ({ messageClient }: Props) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newVisibility, setNewVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [newFilterVisibility, setNewVisibilityFilter] = useState<VisibilityFilter>('all');

  const getMessages = useCallback(async () => {
    const latestMessages = await messageClient.get();
    setMessages(latestMessages);
  }, [messageClient]);

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  const onNewMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const onCreateNewMessageClick = async () => {
    await messageClient.create(newMessage, newVisibility);
    await getMessages();
    setNewMessage('');
    setNewVisibility(Visibility.PUBLIC);
  };

  const onLikeMessageClick = (messageId: UUID) => async () => {
    await messageClient.like(messageId);
    await getMessages();
  };

  const onNewVisibilityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewVisibility(event.target.value as Visibility);
  };

  const onVisibilityFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setNewVisibilityFilter(event.target.value as VisibilityFilter);
  };

  const onDeleteMessageClick = (messageId: UUID) => async () => {
    await messageClient.delete(messageId);
    await getMessages();
  };

  const visibleMessages = Array.isArray(messages)
    ? messages
        .sort((left, right) => (left.id > right.id ? 1 : -1))
        .filter((message) =>
          newFilterVisibility === 'all' ? true : message.visibility === newFilterVisibility,
        )
    : [];

  return (
    <>
      <div className="row">
        <input type="text" value={newMessage} onChange={onNewMessageChange} />
        <div>
          <label htmlFor="visibility" hidden>
            Visibility
          </label>
          <select
            name="visibility"
            id="visibility"
            value={newVisibility}
            onChange={onNewVisibilityChange}
          >
            <option value={Visibility.PUBLIC}>Public</option>
            <option value={Visibility.PRIVATE}>Private</option>
          </select>
        </div>

        <button onClick={onCreateNewMessageClick}>Create new message</button>
      </div>
      <div>
        <label htmlFor="visibilityFilter">Filter messages visibility</label>
        <select
          name="visibilityFilter"
          id="visibilityFilter"
          value={newFilterVisibility}
          onChange={onVisibilityFilterChange}
          style={{ display: 'block' }}
        >
          <option value="all">All</option>
          <option value={Visibility.PUBLIC}>Public</option>
          <option value={Visibility.PRIVATE}>Private</option>
        </select>
      </div>

      <ol style={{ lineHeight: '3em' }} role="list">
        {visibleMessages.map((message) => (
          <li
            style={{
              flex: 'inline-flex',
              justifyContent: 'space-between',
            }}
            key={message.id}
          >
            <button
              aria-label="like-message"
              onClick={onLikeMessageClick(message.id)}
              style={{ marginRight: '15px' }}
            >
              Like
            </button>
            <span style={{ display: 'inline-block', width: '70px' }}>
              {message.liked_count > 0 ? `Likes: ${message.liked_count}` : ''}
            </span>
            <span>{message.message}</span>
            <span> - {message.visibility}</span>
            <button
              aria-label="delete-message"
              onClick={onDeleteMessageClick(message.id)}
              style={{
                marginRight: '15px',
                float: 'right',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ol>
    </>
  );
};

export default App;
