import { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [repos, setRepos] = useState<{ [key: string]: any[] }>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState('');

  const searchUsers = async () => {
    if (!query) return;
    setError('');
    setActiveUser(null);
    setRepos({});
    setLoadingUsers(true);
    try {
      const res = await axios.get(`https://api.github.com/search/users?q=${query}`);
      setUsers(res.data.items.slice(0, 5));
      setSubmittedQuery(query);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUser = async (username: string) => {
    if (activeUser === username) {
      setActiveUser(null);
    } else {
      setActiveUser(username);
      if (!repos[username]) {
        setLoadingRepos(true);
        try {
          const res = await axios.get(`https://api.github.com/users/${username}/repos`);
          setRepos((prev) => ({ ...prev, [username]: res.data }));
        } catch {
          setError('Failed to fetch repositories.');
        } finally {
          setLoadingRepos(false);
        }
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
        placeholder="Enter username"
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #ccc',
          borderRadius: 4,
          marginBottom: '0.5rem'
        }}
      />
      <button
        onClick={searchUsers}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#0284c7',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Search
      </button>

      {submittedQuery && users.length > 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#555' }}>
          Showing users for “<strong>{submittedQuery}</strong>”
        </p>
      )}

      {loadingUsers && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {submittedQuery && !loadingUsers && users.length === 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#888' }}>
          No users found for “<strong>{submittedQuery}</strong>”
        </p>
      )}

      <div style={{ marginTop: '1rem' }}>
        {users.map((user) => (
          <div key={user.login} style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: '0.5rem' }}>
            <div
              onClick={() => toggleUser(user.login)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                cursor: 'pointer',
                backgroundColor: '#fff'
              }}
            >
              <span>{user.login}</span>
              <span>{activeUser === user.login ? '▴' : '▾'}</span>
            </div>

            {activeUser === user.login && (
              <div style={{ backgroundColor: '#f1f1f1', padding: '0.5rem 0.75rem' }}>
                {loadingRepos ? (
                  <p>Loading repositories...</p>
                ) : repos[user.login]?.length ? (
                  repos[user.login].map((repo) => (
                    <div
                      key={repo.id}
                      style={{
                        backgroundColor: 'white',
                        padding: '0.75rem',
                        borderRadius: 4,
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        border: '1px solid #ddd'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{repo.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#555' }}>{repo.description}</div>
                      </div>
                      <div style={{ whiteSpace: 'nowrap', paddingLeft: '1rem' }}>
                        <strong>{repo.stargazers_count}</strong> ⭐
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No repositories found.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
