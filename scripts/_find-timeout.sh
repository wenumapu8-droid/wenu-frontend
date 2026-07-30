#!/usr/bin/env bash
cd ~/.hermes || exit 1
echo '=== enforce sites (Script timed out / idle for) ==='
grep -rInE 'Script timed out after|idle for|idle_limit|IDLE|script_timeout|timeout_seconds|max_seconds' hermes-agent 2>/dev/null | grep -iE 'timeout|idle' | head -30
echo
echo '=== default timeout constants ==='
grep -rInE '= *120\b|= *600\b|600s|120s|DEFAULT.*TIMEOUT|TIMEOUT.*=|IDLE.*=' hermes-agent 2>/dev/null | grep -iE 'timeout|idle' | head -25
echo
echo '=== config.yaml relevant ==='
grep -niE 'timeout|idle|cron|max_.*sec|limit' config.yaml 2>/dev/null | head -30
