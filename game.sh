#!/bin/bash

create_mode=$1
env_name=$2
type_arg=$3

echo "node version: $(node -v)"

function newGame() {
    echo "創建專案 env: $env_name, git remote url: $type_arg"
    rm -rf .git;
    git init;
    if [ "$type_arg" != "" ]; then
        if echo "$type_arg" | grep -q "git@" && echo "$type_arg" | grep -q ".git"; then
            git remote add origin $type_arg
        else
            echo "錯誤: 正確指令格式 >>>>  game:new [env_name] [git_remote_path]"
            echo "請確認 [git_remote_path] 是否正確"
            exit;
        fi
    fi
    envNew # 安裝環境設定
    installSub # 安裝submodule
    # package.json已更換 環境版本的 內容, 以下行數則可呼叫 env 的package.json 指令
    yarn run assets:update # 打包assets
    yarn run init # git link
    git add .; git commit -m "initial commit"
    yarn;
}

function develop() {
    echo "創建開發者模式"
    if [ -f ./package_old.json ]; then
        echo "已保留default檔案"
    else
        echo "保留default檔案"
        mv ./package.json ./package_old.json # default用的package.json 不能被覆蓋掉
        mv ./.gitignore ./.gitignore_old
    fi

    envNew # 安裝環境設定
    installSub # 安裝submodule
    # package.json已更換 環境版本的 內容, 以下行數則可呼叫 env 的package.json 指令
    yarn run assets:update # 打包assets
    yarn run init # git link
    # package.json 還原到default版本
    if [ "$1" != "-d" ]; then
        revertPKJ ""
    fi
    # git 退回sub版本
    backSub
    yarn

}

function config() {
    echo "內容以下"
    if [ -f .gitmodules ]; then
        echo ".gitmodules 檔案存在"
        if [ -s .gitmodules ]; then
            echo ".gitmodules 內容存在"
        else
            echo ".gitmodules 內容不存在"
        fi
    else
        echo ".gitmodules 檔案不存在"
    fi

    if grep -q "\[submodule" .git/config; then
        echo "git/config 有子模組"
    else
        echo "git/config 未包含子模組"
    fi

    if [ -f .git/config ]; then
        if [ "$1" = "-l" ]; then
            cat .git/config
        fi
    else
        echo ".git/config 文件不存在"
    fi

    status_output=$(git status)
    if echo "$status_output" | grep -q "Untracked files:" && echo "$status_output" | grep -q ".gitmodules"; then
        echo "status_output 已存在 .gitmodules"
    else
        echo "status_output 不存在 .gitmodules"
    fi

    if echo "$status_output" | grep -q "Untracked files:" && echo "$status_output" | grep -q ".gitmodules"; then
        echo "status_output 已存在 .gitmodules"
        # git restore --staged
    else
        echo "status_output 不存在 .gitmodules"
    fi

    staged_files=$(git diff --cached --name-only)
    submodule_files=$(echo "$staged_files" | grep "src/")
    if [ -n "$submodule_files" ]; then
        echo "已暂存（staged）的submodule： $submodule_files"
    else
        echo "没有已暂存（staged）的submodule："
    fi
}

function closeSub() {
    rm -rf src/sdk;
    rm -rf .git/modules/src
    local submodules=("src/sdk/kernel" "src/sdk/share" "src/sdk/protocol")
    for submodule in "${submodules[@]}"; do
        git submodule deinit -f "$submodule"
        git config --local --remove-section "submodule.$submodule"
    done
}


# 退回版本
function backSub() {
    staged_files=$(git diff --cached --name-only)
    submodule_files=$(echo "$staged_files" | grep "src/sdk")
    echo "退回版本 staged_files:$staged_files, submodule_files: $submodule_files"
    git restore --staged src/sdk
    git restore --staged .gitmodules
}

function installSub() {
    echo "安裝submodule"
    closeSub
    backSub
    if [ ! -e .gitmodules ]; then
        echo ".gitmodules 不檔案存在"
        touch .gitmodules
    fi
    git submodule init
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/kernel.git src/sdk/kernel;
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/protocol.git src/sdk/protocol;
    git submodule add --force git@gitlab.vastplay.online:f2e-kernel/sdk/share.git src/sdk/share

    git config -f .gitmodules submodule.src/sdk/kernel.ignore all;
    git config -f .gitmodules submodule.src/sdk/protocol.ignore all;
    git config -f .gitmodules submodule.src/sdk/share.ignore all;

    yarn run sub dirty
}

function revertPKJ() {
    echo "還原default的檔案"
    if [ -f ./package_old.json ]; then
        rm -rf ./package.json
        mv ./package_old.json ./package.json # package.json 還原
    fi

    if [ -f ./.gitignore_old ]; then
        rm -rf ./.gitignore
        mv ./.gitignore_old ./.gitignore # .gitignore 還原
    fi
}

function envNew() {
    echo "安裝環境設定 $env_name"
    if [ "$env_name" = "" ]; then
        echo "請確認是否填入env的名稱"
        exit;
    fi

    envPath="env-$env_name.git"
    if echo "$env_name" | grep -q "env-" && echo "$env_name" | grep -q ".git"; then
        envPath="$env_name"
    elif echo "$env_name" | grep -q "env-"; then
        envPath="$env_name.git"
    fi

    if [ -d "env-folder" ]; then
        rm -rf env-folder
    fi

    git clone https://gitlab.vastplay.online/f2e-kernel/game-settings/$envPath env-folder;
    if [ -d "env-folder" ]; then
        cd env-folder
        rm -rf README.md
        cd ..
        envClear "env-folder"
        cd env-folder
        mv -f ./* ../
        mv .gitignore ../
        cd ..
        rm -rf env-folder
    else
        echo "請確認 $envPath 是否存在,或者是否沒有權限"
        echo "Git-Path: https://gitlab.vastplay.online/f2e-kernel/game-settings/$envPath"
        exit;
    fi
}

function envClear() {
    for element in `ls $1`; do
        rm -rf ./$element
    done
}

function envUpdate() {
    if [ -d "env-folder" ]; then
        rm -rf env-folder
    fi
    envNew
    yarn
    yarn run init
}

if [ "$create_mode" = "new" ]; then
    newGame
elif [ "$create_mode" = "develop" ]; then
    develop $type_arg
elif [ "$create_mode" = "config" ]; then
    config $env_name
elif [ "$create_mode" = "revertPKJ" ]; then
    revertPKJ
elif [ "$create_mode" = "envNew" ]; then
    envNew
elif [ "$create_mode" = "envUpdate" ]; then
    envUpdate
fi