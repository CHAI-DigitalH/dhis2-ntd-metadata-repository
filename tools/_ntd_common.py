"""
_ntd_common.py — shared helpers for the NTD tooling (configure, build_*, install,
validate_import).

Kept dependency-light on purpose: only `requests` (for the scripts that talk to a
live DHIS2) and, optionally, PyYAML (config files may be YAML or JSON). Import of
PyYAML is deferred so that scripts which only need JSON configs still run without it.
"""

import json
import sys


# ── Sierra Leone reference identifiers ───────────────────────────────────────
# These are the source UIDs baked into the reference package. configure.py swaps
# the national root for the adopting country's; the districts are only relevant
# for charts that were NOT relativized (see docs/adaptation.md).
SL_NATIONAL_UID = "ImspTQPwCqd"

SL_DISTRICT_UIDS = [
    "O6uvpzGd5pu",  # Bo
    "fdc6uOvgoji",  # Bombali
    "lc3eMKXaEfw",  # Bonthe
    "jUb8gELQApl",  # Kailahun
    "PMa2VCrupOd",  # Kambia
    "kJq2mPyFEHo",  # Kenema
    "qhqAxPSTUXp",  # Koinadugu
    "Vth0fbpFcsO",  # Kono
    "jmIPBj66vD6",  # Moyamba
    "TEQlaapDQoK",  # Port Loko
    "bL4ooGhyHRQ",  # Pujehun
    "eIQbndfxQMb",  # Tonkolili
    "at6UHUQatSo",  # Western Area
]

# Fields DHIS2 export emits that should never be imported into a fresh instance:
# audit trails, ownership, and (belt-and-suspenders, even with "skip sharing" on
# export) any sharing/access properties that reference the source instance's users.
AUDIT_AND_SHARING_FIELDS = {
    "created",
    "lastUpdated",
    "createdBy",
    "lastUpdatedBy",
    "user",
    "href",
    "access",
    "favorite",
    "favorites",
    "sharing",
    "publicAccess",
    "externalAccess",
    "userGroupAccesses",
    "userAccesses",
    # Instance-specific custom-attribute values: they reference attribute objects that are
    # not shipped and may not be valid for the target's object types, which fails the import.
    "attributeValues",
}

# Canonical dependency order. DHIS2's importer sorts internally, so this is used
# for pretty, predictable file layout and for staged/manual imports — not as a
# hard requirement for a single-file API import.
IMPORT_ORDER = [
    "categories",
    "categoryOptions",
    "categoryCombos",
    "categoryOptionCombos",
    "optionSets",
    "options",
    "dataElements",
    "dataElementGroups",
    "dataSets",
    "sections",
    "indicatorTypes",
    "indicators",
    "indicatorGroups",
    "visualizations",
    "maps",
    "dashboards",
    "validationRules",
    "validationRuleGroups",
]


def load_config(path):
    """Load a config file. Accepts .json or .yaml/.yml."""
    with open(path, "r", encoding="utf-8") as fh:
        text = fh.read()
    if path.lower().endswith(".json"):
        return json.loads(text)
    try:
        import yaml  # noqa: WPS433 (deferred import by design)
    except ImportError:
        sys.exit(
            "This config is YAML but PyYAML is not installed.\n"
            "Install it (pip install -r tools/requirements.txt) or use a .json config."
        )
    return yaml.safe_load(text)


def make_session(username=None, password=None, token=None):
    """Build an authenticated requests.Session for the DHIS2 API."""
    try:
        import requests  # noqa: WPS433
    except ImportError:
        sys.exit("This step needs the `requests` package. Run: pip install -r tools/requirements.txt")

    session = requests.Session()
    if token:
        session.headers.update({"Authorization": f"ApiToken {token}"})
    elif username and password:
        session.auth = (username, password)
    else:
        sys.exit("Provide either --token or both --username and --password.")
    session.headers.update({"Accept": "application/json"})
    return session


def add_auth_args(parser):
    """Attach the standard auth flags to an argparse parser."""
    parser.add_argument("--base-url", required=True, help="DHIS2 base URL, e.g. https://your-instance.org")
    parser.add_argument("--username", help="DHIS2 username (basic auth)")
    parser.add_argument("--password", help="DHIS2 password (basic auth)")
    parser.add_argument("--token", help="DHIS2 personal access token (alternative to username/password)")
