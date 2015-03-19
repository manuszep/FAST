{% set fast_color_list =
    [
        {"name": "blue-xxd", "color": "#103184"},
        {"name": "blue-xd", "color": "#004893"},
        {"name": "blue-d", "color": "#2253AF"},
        {"name": "blue", "color": "#0060D6"},
        {"name": "blue-l", "color": "#4A89DC"},
        {"name": "blue-xl", "color": "#5D9CEC"},

        {"name": "cyan", "color": "#3BAFDA"},
        {"name": "cyan-l", "color": "#4FC1E9"},

        {"name": "red-d", "color": "#C70000"},
        {"name": "red", "color": "#E30000"},
        {"name": "red-l", "color": "#FF1821"},

        {"name": "orange-d", "color": "#D35400"},
        {"name": "orange", "color": "#E67E22"},

        {"name": "yellow-d", "color": "#F6BB42"},
        {"name": "yellow", "color": "#FFCE54"},

        {"name": "green-d", "color": "#66AF44"},
        {"name": "green", "color": "#8CC152"},
        {"name": "green-l", "color": "#A0D468"},

        {"name": "turquoise", "color": "#37BC9B"},
        {"name": "turquoise-l", "color": "#48CFAD"},

        {"name": "grey-xd", "color": "#333333"},
        {"name": "grey-d", "color": "#616367"},
        {"name": "grey", "color": "#999999"},
        {"name": "grey-l", "color": "#B3B3B3"},
        {"name": "grey-xl", "color": "#EFEBEA"},
        {"name": "grey-xxl", "color": "#F2F2F2"},

        {"name": "cold-grey-xd", "color": "#434A54"},
        {"name": "cold-grey-d", "color": "#656D78"},
        {"name": "cold-grey", "color": "#AAB2BD"},
        {"name": "cold-grey-l", "color": "#CCD1D9"},
        {"name": "cold-grey-xl", "color": "#E6E9ED"},
        {"name": "cold-grey-xxl", "color": "#F5F7FA"},

        {"name": "white", "color": "#fff"},
        {"name": "black", "color": "#000"}
    ]
%}

{% set data_table = {
    "thead": [
        {
            "type": "th",
            "value": "Heading 1"
        },{
            "type": "th",
            "value": "Heading 2"
        },{
            "type": "th",
            "value": "Heading 3"
        },{
            "type": "th",
            "value": "Heading 4"
        },{
            "type": "th",
            "value": "Heading 5"
        }
    ],
    "tfoot": [
        {
            type: "td",
            "value": "Footer 1"
        },{
            "type": "td",
            "value": "Footer 2"
        },{
            "type": "td",
            "value": "Footer 3"
        },{
            "type": "td",
            "value": "Footer 4"
        },{
            "type": "td",
            "value": "Footer 5"
        }
    ],
    "tbody": [
      [
        {
          "type": "th",
          "value": "Row 1 Heading"
        },
        {
          "type": "td",
          "value": "Row 1 Cell 1"
        },
        {
          "type": "td",
          "value": "Row 1 Cell 2"
        },
        {
          "type": "td",
          "value": "Row 1 Cell 3"
        },
        {
          "type": "td",
          "value": "Row 1 Cell 4"
        }
      ],
      [
        {
          "type": "th",
          "value": "Row 2 Heading"
        },
        {
          "type": "td",
          "value": "Row 2 Cell 1"
        },
        {
          "type": "td",
          "value": "Row 2 Cell 2"
        },
        {
          "type": "td",
          "value": "Row 2 Cell 3"
        },
        {
          "type": "td",
          "value": "Row 2 Cell 4"
        }
      ],
      [
        {
          "type": "th",
          "value": "Row 3 Heading"
        },
        {
          "type": "td",
          "value": "Row 3 Cell 1"
        },
        {
          "type": "td",
          "value": "Row 3 Cell 2"
        },
        {
          "type": "td",
          "value": "Row 3 Cell 3"
        },
        {
          "type": "td",
          "value": "Row 3 Cell 4"
        }
      ],
      [
        {
          "type": "th",
          "value": "Row 4 Heading"
        },
        {
          "type": "td",
          "value": "Row 4 Cell 1"
        },
        {
          "type": "td",
          "value": "Row 4 Cell 2"
        },
        {
          "type": "td",
          "value": "Row 4 Cell 3"
        },
        {
          "type": "td",
          "value": "Row 4 Cell 4"
        }
      ],
      [
        {
          "type": "th",
          "value": "Row 5 Heading"
        },
        {
          "type": "td",
          "value": "Row 5 Cell 1"
        },
        {
          "type": "td",
          "value": "Row 5 Cell 2"
        },
        {
          "type": "td",
          "value": "Row 5 Cell 3"
        },
        {
          "type": "td",
          "value": "Row 5 Cell 4"
        }
      ]
    ]
} %}
