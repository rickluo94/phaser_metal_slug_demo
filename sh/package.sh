#!/bin/bash

# bash --version

function close() {
    rm -rf src/sdk; # 移除路徑資料夾
    rm -rf .git/modules/src #移除.git子目錄
    # 移除.git/config的子目錄
    local submodules=("src/sdk/kernel" "src/sdk/share" "src/sdk/protocol")
    for submodule in "${submodules[@]}"; do
        git submodule deinit -f "$submodule"
        git config --local --remove-section "submodule.$submodule"
    done
    # git unstage
    staged_files=$(git diff --cached --name-only)
    submodule_files=$(echo "$staged_files" | grep "src/")
    git restore --staged .gitmodules
}

function clearGitCmt() {
    close
    git add src/sdk
    git add .gitmodules
    git commit -m '清除git 與submodule同名衝突的資料夾紀錄'
}

function dirty() {
    git config -f .gitmodules submodule.src/sdk/kernel.ignore all
    git config -f .gitmodules submodule.src/sdk/protocol.ignore all
    git config -f .gitmodules submodule.src/sdk/share.ignore all
}

function install() {
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/kernel.git src/sdk/kernel;
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/protocol.git src/sdk/protocol;
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/share.git src/sdk/share
}

function update() {
    git submodule foreach --recursive git checkout main;
    git submodule foreach --recursive git pull origin main
}

case "$1" in
    "close")
        close
        ;;
    "clearGitCmt")
        clearGitCmt
        ;;
    "dirty")
        dirty
        ;;
    "install")
        install
        ;;
    "update")
        update
        ;;
    *)
esac