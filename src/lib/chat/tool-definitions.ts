// ---------------------------------------------------------------------------
// Tool Definitions - OpenAI-compatible function/tool schemas for Squadi API
// Works with any provider that supports function calling (OpenAI, DeepSeek, etc.)
// ---------------------------------------------------------------------------

import type { ChatCompletionTool } from 'openai/resources/chat/completions'

export const CHAT_TOOLS: readonly ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_organisations',
      description:
        'Fetch all basketball organisations. Use this to find an organisation by name.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_competitions',
      description:
        'Fetch competitions for a given organisation. Requires the organisation unique key.',
      parameters: {
        type: 'object',
        properties: {
          organisationUniqueKey: {
            type: 'string',
            description: 'The unique key (GUID) of the organisation',
          },
        },
        required: ['organisationUniqueKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_divisions',
      description:
        'Fetch divisions for a competition. Use to find age groups/grades like "U18 Boys", "Open Women", etc.',
      parameters: {
        type: 'object',
        properties: {
          competitionKey: {
            type: 'string',
            description: 'The unique key (GUID) of the competition',
          },
        },
        required: ['competitionKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_teams',
      description:
        'Fetch teams within a specific competition and division.',
      parameters: {
        type: 'object',
        properties: {
          competitionId: {
            type: 'number',
            description: 'The numeric competition ID',
          },
          divisionId: {
            type: 'number',
            description: 'The numeric division ID',
          },
          organisationId: {
            type: 'string',
            description: 'The organisation unique key (GUID)',
          },
        },
        required: ['competitionId', 'divisionId', 'organisationId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_team_detail',
      description:
        'Fetch detailed team info including roster/players for a specific team.',
      parameters: {
        type: 'object',
        properties: {
          teamUniqueKey: {
            type: 'string',
            description: 'The team unique key (GUID)',
          },
        },
        required: ['teamUniqueKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_player_profile',
      description: 'Fetch a player profile by player ID.',
      parameters: {
        type: 'object',
        properties: {
          playerId: {
            type: 'number',
            description: 'The numeric player ID',
          },
        },
        required: ['playerId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_fixtures',
      description:
        'Fetch fixture/match schedule by round for a competition and division.',
      parameters: {
        type: 'object',
        properties: {
          competitionId: {
            type: 'number',
            description: 'The numeric competition ID',
          },
          divisionId: {
            type: 'number',
            description: 'The numeric division ID',
          },
        },
        required: ['competitionId', 'divisionId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_game_summary',
      description:
        'Fetch the game summary (scores, player stats) for a specific match.',
      parameters: {
        type: 'object',
        properties: {
          matchId: {
            type: 'number',
            description: 'The numeric match ID',
          },
          competitionUniqueKey: {
            type: 'string',
            description: 'The competition unique key (GUID)',
          },
        },
        required: ['matchId', 'competitionUniqueKey'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_scoring_stats',
      description:
        'Fetch scoring statistics leaderboard for a division. Available stat types: TOTALPOINTS, AVGPOINTS, TWOPOINTS, THREEPOINTS, FREETHROWS, TOTALPF.',
      parameters: {
        type: 'object',
        properties: {
          statType: {
            type: 'string',
            enum: [
              'TOTALPOINTS',
              'AVGPOINTS',
              'TWOPOINTS',
              'THREEPOINTS',
              'FREETHROWS',
              'TOTALPF',
            ],
            description: 'The stat type to query',
          },
          divisionId: {
            type: 'number',
            description: 'The numeric division ID',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 20)',
          },
        },
        required: ['statType', 'divisionId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_game_action_log',
      description:
        'Fetch play-by-play action log for a specific match.',
      parameters: {
        type: 'object',
        properties: {
          matchId: {
            type: 'number',
            description: 'The numeric match ID',
          },
          competitionId: {
            type: 'string',
            description: 'The competition ID',
          },
        },
        required: ['matchId', 'competitionId'],
      },
    },
  },
]
